"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createComment } from "@/app/space/actions";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  comments: any[];
  currentUser?: any;
  isSpaceOwner?: boolean; // New prop to control deletion permission
}

export default function CommentSection({ postId, comments, currentUser, isSpaceOwner = false }: CommentSectionProps) {
  const [commentList, setCommentList] = useState(comments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleDeleteComment = async (commentId: string) => {
    // Only allow deletion if user is the space owner OR if they are the comment author
    // But for simplicity/moderation, let's strictly check permissions before showing button.
    if (!confirm("确定要删除这条评论吗？")) return;

    try {
      const res = await fetch("/api/comment/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("评论已删除", {
        duration: 1000,
        style: {
          background: '#000',
          color: '#fff',
          border: 'none'
        }
      });
      // Optimistically remove from list
      setCommentList(prev => prev.filter(c => c.id !== commentId));
      router.refresh();
    } catch (error) {
      toast.error("删除失败");
    }
  };

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
        toast.success("评论已提交", {
          duration: 1000,
          style: {
            background: '#000',
            color: '#fff',
            border: 'none'
          }
        });
        setContent("");
        
        // Optimistically add the new comment to the list
        if (result.comment) {
          setCommentList(prev => [result.comment, ...prev]);
        }
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
        {commentList.map((comment) => {
          const isGuest = comment.nickname === "访客" || !comment.nickname;
          
          return (
            <div 
              key={comment.id} 
              id={`comment-${comment.id}`} // Anchor for notification jump
              className="flex gap-3 group/comment scroll-mt-24"
            >
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm relative">
                <div className="flex justify-between items-center mb-1">
                  {isGuest ? (
                    <span className="font-semibold text-gray-900">{comment.nickname}</span>
                  ) : (
                    <Link 
                      href={`/space/${encodeURIComponent(comment.nickname)}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                    >
                      {comment.nickname}
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
                    </span>
                    {currentUser && (isSpaceOwner || currentUser.name === comment.nickname) && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover/comment:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                        title="删除评论"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          );
        })}
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
