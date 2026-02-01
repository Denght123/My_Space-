"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPost } from "@/app/space/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Send } from "lucide-react";

export default function CreatePost({ user, authorName, avatarUrl }: { user: any, authorName: string, avatarUrl?: string | null }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      
      const result = await createPost(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("发布成功！");
        setContent("");
      }
    } catch (error) {
      toast.error("发布失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        {/* Avatar removed */}
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的新鲜事..."
            className="w-full bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 gap-2">
              <Image className="w-4 h-4" />
              <span className="text-xs">添加图片</span>
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="bg-black hover:bg-gray-800 text-white gap-2 rounded-full px-6"
              disabled={!content.trim() || isSubmitting}
            >
              <Send className="w-3 h-3" />
              {isSubmitting ? "发布中..." : "发布"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
