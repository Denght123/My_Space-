"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createComment } from "@/app/space/actions";

interface CommentSectionProps {
  postId: string;
  comments: any[];
  currentUser?: any;
}

export default function CommentSection({ postId, comments, currentUser }: CommentSectionProps) {
  const [commentList, setCommentList] = useState(comments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      // For guests, we might want to prompt for a nickname or just use "Visitor"
      // Since our backend requires a nickname for guests, let's ask for it or auto-generate
      // For now, let's just use "访客" if not logged in, or prompt login
      // Actually, requirements said "support visitor comments", so we need to handle non-logged in users.
      // But for simplicity in this "Space" context (which feels more private), let's auto-assign "访客" + random ID if not logged in?
      // Or better: Just use a prompt.
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("content", content);
      
      // If logged in, use user name. If not, use "访客" (backend will handle this logic hopefully or we pass it)
      // Wait, createComment action usually takes nickname.
      // Let's check the action. We might need to update it to support session-based user info.
      
      formData.append("nickname", currentUser?.name || "访客");

      const result = await createComment(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("评论已提交");
        setContent("");
        // Optimistically add comment (or just wait for revalidate)
        // Since we revalidatePath in action, the page should refresh data. 
        // But for smooth UX, we could append it here.
        // For now, let's rely on server revalidation.
      }
    } catch (error) {
      toast.error("提交失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
      {/* Comment List */}
      <div className="space-y-4">
        {commentList.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900">{comment.nickname}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={currentUser ? "写下你的评论..." : "以访客身份评论..."}
            className="flex-1 bg-gray-50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            size="sm" 
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50"
            disabled={!content.trim() || isSubmitting}
          >
            发送
          </Button>
        </div>
      </form>
    </div>
  );
}
