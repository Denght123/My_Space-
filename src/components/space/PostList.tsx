"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2, X, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import PostCard from "./PostCard";

interface PostListProps {
  initialPosts: any[];
  currentUser: any;
  isOwnProfile: boolean;
}

export default function PostList({ initialPosts, currentUser, isOwnProfile }: PostListProps) {
  const router = useRouter();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // If not own profile, just render list normally
  if (!isOwnProfile) {
    return (
      <div className="space-y-6">
        {initialPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={currentUser} 
            authorName={post.author?.nickname || post.author?.username || "匿名用户"} 
            authorAvatar={post.author?.avatarUrl}
            isOwnProfile={false}
          />
        ))}
      </div>
    );
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === initialPosts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialPosts.map(p => p.id));
    }
  };

  const toggleSelectPost = (postId: string) => {
    if (selectedIds.includes(postId)) {
      setSelectedIds(prev => prev.filter(id => id !== postId));
    } else {
      setSelectedIds(prev => [...prev, postId]);
    }
  };

  const confirmBatchDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      const res = await fetch("/api/post/batch-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Batch delete failed");

      toast.success(`已删除 ${selectedIds.length} 篇文章`, {
        duration: 1000,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      
      setIsSelectionMode(false);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("批量删除失败");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Batch Actions Toolbar */}
      {initialPosts.length > 0 && (
        <div className="flex justify-between items-center py-2 px-1">
          {isSelectionMode ? (
            <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSelectionMode}
                className="text-gray-500 hover:text-black"
              >
                取消
              </Button>
              <div className="h-4 w-px bg-gray-200"></div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSelectAll}
                className="text-gray-600"
              >
                {selectedIds.length === initialPosts.length ? "取消全选" : "全选"}
              </Button>
              <div className="flex-1"></div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedIds.length === 0 || isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除 ({selectedIds.length})
              </Button>
            </div>
          ) : (
            <div className="flex justify-end w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSelectionMode}
                className="text-gray-500 hover:text-black hover:border-black transition-colors rounded-full text-xs"
              >
                <ListChecks className="w-4 h-4 mr-2" />
                批量管理
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Post List */}
      <div className="space-y-6">
        {initialPosts.map((post) => (
          <div 
            key={post.id} 
            className={`relative flex items-start transition-all duration-300 ${isSelectionMode ? "cursor-pointer" : ""}`}
            onClick={() => isSelectionMode && toggleSelectPost(post.id)}
          >
            {/* Left Selection Area - Expands when selection mode is active */}
            <div 
              className={`flex items-start pt-6 overflow-hidden transition-all duration-300 ease-in-out ${
                isSelectionMode ? "w-10 opacity-100 mr-2" : "w-0 opacity-0 mr-0"
              }`}
            >
              <Checkbox 
                checked={selectedIds.includes(post.id)}
                onCheckedChange={() => toggleSelectPost(post.id)}
                className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black mt-1" // Align with card header
              />
            </div>

            {/* Post Card - Flex Grow to fill remaining space */}
            <div className="flex-1 min-w-0">
              <PostCard 
                post={post} 
                currentUser={currentUser} 
                authorName={post.author?.nickname || post.author?.username || "匿名用户"} 
                authorAvatar={post.author?.avatarUrl}
                isOwnProfile={isOwnProfile}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Batch Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-black border-2 rounded-xl shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">确认批量删除？</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              你即将删除选中的 {selectedIds.length} 篇文章。此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0 hover:bg-gray-100 rounded-lg">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBatchDelete}
              className="bg-black text-white hover:bg-gray-800 rounded-lg"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
