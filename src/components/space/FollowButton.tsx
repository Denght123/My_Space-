"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export default function FollowButton({ userId, isFollowing: initialFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsFollowing(data.isFollowing);
      
      toast.success(data.isFollowing ? "关注成功" : "已取消关注", {
        duration: 1000,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      
      router.refresh(); // Refresh to update stats
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleFollow}
      disabled={isLoading}
      className={`w-full rounded-full transition-all duration-300 mt-4 ${
        isFollowing 
          ? "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200" 
          : "bg-black text-white hover:bg-gray-800"
      }`}
    >
      {isLoading ? "处理中..." : isFollowing ? "已关注" : "关注"}
    </Button>
  );
}
