"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SearchHistoryItem {
  id: string;
  query: string;
}

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Close history when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/search/history");
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (e) {
      // Ignore error
    }
  };

  const addToHistory = async (q: string) => {
    try {
      await fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      // Refresh history list immediately to show the new item next time
      fetchHistory(); 
    } catch (e) {
      // Ignore
    }
  };

  const deleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking item
    try {
      await fetch("/api/search/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      toast.error("删除失败");
    }
  };

  const handleSearch = async (e?: React.FormEvent, manualQuery?: string) => {
    if (e) e.preventDefault();
    const q = manualQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setErrorMsg("");
    setShowHistory(false);

    try {
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (data.found && data.user) {
        // Save to history before navigating
        addToHistory(data.user.username);

        const safeUsername = encodeURIComponent(data.user.username);
        window.location.href = `/space/${safeUsername}`;
        setQuery("");
      } else {
        setErrorMsg("未找到该用户");
        setTimeout(() => setErrorMsg(""), 1500);
      }
    } catch (error) {
      toast.error("搜索失败");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative w-full" ref={wrapperRef}>
      <div className="relative w-full">
        <form onSubmit={handleSearch} className="relative w-full flex items-center">
          <Input
            type="text"
            placeholder="搜索用户..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if(errorMsg) setErrorMsg("");
            }}
            onFocus={() => setShowHistory(true)}
            className="pl-3 pr-10 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-full text-sm w-full min-w-[120px]" 
            disabled={isSearching}
          />
          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-1 p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* History Dropdown - Now nested inside the width-constrained wrapper */}
        {showHistory && !query && history.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs text-gray-400 px-3 py-1 mb-1 font-medium">最近搜索</div>
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setQuery(item.query);
                  handleSearch(undefined, item.query);
                }}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer group text-sm text-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="truncate">{item.query}</span>
                </div>
                <button 
                  onClick={(e) => deleteHistory(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Inline Error Message */}
      <div className={`h-9 px-3 flex items-center text-xs text-white bg-black rounded-full whitespace-nowrap transition-opacity duration-1000 ease-in-out ${errorMsg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {errorMsg || "未找到该用户"} 
      </div>
    </div>
  );
}
