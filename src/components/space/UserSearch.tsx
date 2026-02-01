"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.found && data.user) {
        // Navigate to user's space
        // Using window.location.href ensures a full reload which sometimes helps with stale router cache
        // But router.push is better for SPA feel. Let's try router.push first, but ensure path is correct.
        
        // Use encodeURIComponent for the username in the URL path to handle special characters
        const safeUsername = encodeURIComponent(data.user.username);
        console.log("Navigating to:", `/space/${safeUsername}`);
        
        // Force full page reload to ensure server components re-fetch data correctly
        window.location.href = `/space/${safeUsername}`;
        setQuery("");
      } else {
        toast.error("用户不存在");
      }
    } catch (error) {
      toast.error("搜索失败");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs flex items-center">
      <Input
        type="text"
        placeholder="搜索用户..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-3 pr-10 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-full text-sm w-full"
        disabled={isSearching}
      />
      <button 
        type="submit"
        disabled={isSearching || !query.trim()}
        className="absolute right-1 p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
