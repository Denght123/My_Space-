"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FollowListDialogProps {
  userId: string;
  type: "following" | "followers";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FollowListDialog({ userId, type, isOpen, onOpenChange }: FollowListDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Fetch users
      // Note: We need separate APIs for following vs followers. 
      // I only implemented GET /following so far. Assuming /followers is similar or same route with query param.
      // Let's use /api/user/[userId]/following for now.
      // If type is followers, we need another route. I'll implement just following for now as per requirement 1.
      
      const endpoint = type === "following" 
        ? `/api/user/${userId}/following` 
        : `/api/user/${userId}/followers`; // Need to implement this

      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          if (data.following) setUsers(data.following);
          // Handle followers data structure if different
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId, type]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{type === "following" ? "关注列表" : "粉丝列表"}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="text-center text-sm text-gray-500">加载中...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-sm text-gray-500">列表为空</div>
          ) : (
            users.map((user) => (
              <Link 
                key={user.id} 
                href={`/space/${encodeURIComponent(user.username)}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <Avatar className="w-10 h-10 border border-gray-100">
                  <AvatarImage src={user.avatarUrl || "https://github.com/shadcn.png"} />
                  <AvatarFallback>{user.username.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{user.nickname || user.username}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
