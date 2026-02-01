"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { toggleLike } from "@/app/space/actions";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: any;
  currentUser?: any;
  authorName?: string; 
}

export default function PostCard({ post, currentUser, authorName = "博主" }: PostCardProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("请先登录后点赞");
      return;
    }
    
    // Optimistic update
    const previousLikes = likes;
    const previousIsLiked = isLiked;
    
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike(post.id);
      if (result.error) throw new Error(result.error);
    } catch (error) {
      // Revert on error
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
      toast.error("操作失败，请重试");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleShare = async () => {
    // Copy link to clipboard safely
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      toast.error("无法访问剪贴板");
      return;
    }

    try {
      const url = `${window.location.origin}/blog/${post.slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("链接已复制到剪贴板");
    } catch (err) {
      toast.error("复制失败");
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      const res = await fetch("/api/post/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("已删除");
      router.refresh(); 
    } catch (error) {
      toast.error("删除失败");
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return null; // Optimistically hide
  }

  return (
    <>
      <article className="bg-white rounded-xl shadow-sm border p-6 space-y-4 hover:shadow-md transition-shadow">
        {/* Author Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{authorName.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{authorName}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: zhCN })}
              </div>
            </div>
          </div>
          
          {/* Dropdown Menu for Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 text-gray-400 h-8 w-8">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Link href={`/blog/${post.slug}`} className="block group">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 line-clamp-3 leading-relaxed">
              {post.excerpt || "点击阅读全文..."}
            </p>
          </Link>
          
          {/* Tags */}
          {post.tags && (
            <div className="flex gap-2 pt-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                #技术
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-1.5 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-gray-500 hover:text-blue-500"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">{post._count?.comments || 0}</span>
            </Button>

            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-green-500" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-medium">分享</span>
            </Button>
          </div>
        </div>

        {showComments && (
          <CommentSection 
            postId={post.id} 
            comments={post.comments || []} 
            currentUser={currentUser}
          />
        )}
      </article>

      {/* Custom Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-black border-2 rounded-xl shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">确认删除？</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              此操作无法撤销。这篇文章将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 hover:bg-gray-100 rounded-lg">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-black text-white hover:bg-gray-800 rounded-lg"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
