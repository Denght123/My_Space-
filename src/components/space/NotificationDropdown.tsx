"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    username: string;
    nickname?: string;
    avatarUrl?: string;
  };
  post?: {
    id: string;
    slug: string;
    author: { username: string };
  };
  comment?: {
    id: string;
    content: string;
  };
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark as read locally immediately
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Call API
      try {
        await fetch("/api/notifications/read", { method: "POST" });
      } catch (e) {}
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
      toast.success("通知已清空", {
        duration: 1000,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
    } catch (e) {
      toast.error("清空失败");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full text-gray-500 hover:text-black">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-lg border-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b border-gray-50 font-medium text-sm text-gray-900 flex justify-between items-center">
          <span>通知</span>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center transition-colors"
              title="清空所有通知"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              清空
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            暂无新通知
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((item) => {
              // Construct link: /space/[username]#[commentId]
              // We need encodeURIComponent for username
              const targetUrl = item.post && item.post.author
                ? `/space/${encodeURIComponent(item.post.author.username)}#comment-${item.comment?.id}`
                : "#";

              return (
                <Link 
                  key={item.id} 
                  href={targetUrl}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 hover:bg-gray-50 transition-colors ${!item.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={item.actor?.avatarUrl || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{item.actor?.username?.slice(0, 1).toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-semibold">{item.actor?.nickname || item.actor?.username || "有人"}</span>
                        <span className="text-gray-500 ml-1">
                          {item.type === "COMMENT" ? "评论了你的文章" : "有新动态"}
                        </span>
                      </p>
                      {item.comment?.content && (
                        <p className="text-xs text-gray-500 line-clamp-2 bg-white/50 p-1 rounded">
                          "{item.comment.content}"
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: zhCN })}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
