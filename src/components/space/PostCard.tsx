"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Heart, MessageSquare, MoreHorizontal, Trash2, Edit } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { toggleLike } from "@/app/space/actions";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: any;
  currentUser?: any;
  authorName?: string; 
  authorAvatar?: string | null;
  isOwnProfile?: boolean; 
}

export default function PostCard({ post, currentUser, authorName = "博主", authorAvatar, isOwnProfile = false }: PostCardProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.length > 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Delete states
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);

  // Check permissions
  const canDelete = isOwnProfile || (currentUser?.id && post.authorId === currentUser.id);
  const canEdit = canDelete; 

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("请先登录后点赞");
      return;
    }
    
    const previousLikes = likes;
    const previousIsLiked = isLiked;
    
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
    setIsLikeLoading(true);

    try {
      const result = await toggleLike(post.id);
      if (result.error) throw new Error(result.error);
    } catch (error) {
      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
      toast.error("操作失败，请重试");
    } finally {
      setIsLikeLoading(false);
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
      
      toast.success("已删除", {
        duration: 1000,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      router.refresh(); 
    } catch (error) {
      toast.error("删除失败");
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    
    setIsEditing(true);
    try {
      const res = await fetch("/api/post/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content: editContent }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("已更新", {
        duration: 1000,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      setShowEditDialog(false);
      router.refresh();
    } catch (error) {
      toast.error("更新失败");
    } finally {
      setIsEditing(false);
    }
  };

  if (isDeleting) {
    return null;
  }

  return (
    <>
      <article className="bg-white rounded-xl shadow-sm border p-6 space-y-4 hover:shadow-md transition-shadow">
        {/* Author Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={authorAvatar || "https://github.com/shadcn.png"} />
              <AvatarFallback>{authorName.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{authorName}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: zhCN })}
              </div>
            </div>
          </div>
          
          {/* Dropdown Menu for Actions - Only show if can delete/edit */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 text-gray-400 h-8 w-8">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setShowEditDialog(true)}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="block group cursor-default">
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
              {post.content}
            </div>
          </div>
          
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
          </div>
        </div>

        {showComments && (
          <CommentSection 
            postId={post.id} 
            comments={post.comments || []} 
            currentUser={currentUser}
            isSpaceOwner={isOwnProfile} 
          />
        )}
      </article>

      {/* Anchor for notification jump */}
      <div id={`post-${post.id}`} className="scroll-mt-24" />
      {/* Also add anchor for comments section if expanded */}
      <div id={`comments-${post.id}`} className="scroll-mt-24" />

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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑文章</DialogTitle>
            <DialogDescription>
              修改你的文章内容，完成后点击保存。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[300px] resize-none text-base"
              placeholder="文章内容..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isEditing}>取消</Button>
            <Button 
              onClick={handleUpdate} 
              className="bg-black text-white hover:bg-gray-800"
              disabled={isEditing || !editContent.trim()}
            >
              {isEditing ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
