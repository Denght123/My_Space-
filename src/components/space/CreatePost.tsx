"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createPost } from "@/app/space/actions";
import { uploadFile } from "@/app/space/upload-action";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  Send, 
  Code, 
  Bold,
  Italic
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreatePost({ user, authorName, avatarUrl }: { user: any, authorName: string, avatarUrl?: string | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Add state to track editor content status for button enabling
  const [canPost, setCanPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: '分享你的新鲜事...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[44px] px-2 py-2 text-sm',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Force update button state on every keystroke
      const hasContent = !editor.isEmpty || editor.getHTML().includes('<img');
      setCanPost(hasContent);
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("上传中...");

    try {
      const res = await uploadFile(formData);
      
      if (res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("上传成功", { 
          id: toastId,
          duration: 1000,
          style: { background: '#000', color: '#fff', border: 'none' }
        });
        
        if (file.type.startsWith("image/")) {
          // @ts-ignore
          editor?.chain().focus().setImage({ src: res.url }).run();
        } else {
          const link = `<a href="${res.url}" target="_blank">📎 ${file.name}</a>`;
          editor?.chain().focus().insertContent(link).run();
        }
      }
    } catch (err) {
      toast.error("上传出错", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsertCode = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;

    setIsSubmitting(true);
    try {
      const content = editor?.getHTML() || "";
      
      const formData = new FormData();
      formData.append("content", content);
      
      const result = await createPost(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("发布成功！", {
          duration: 1000,
          style: { background: '#000', color: '#fff', border: 'none' }
        });
        editor?.commands.clearContent();
        setCanPost(false); // Reset button state
      }
    } catch (error) {
      toast.error("发布失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  // SSR Skeleton
  if (!isMounted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="h-[44px] bg-gray-50 rounded-lg w-full mb-3 animate-pulse"></div>
        <div className="flex justify-between border-t border-gray-50 pt-2">
           <div className="flex gap-1"><div className="w-8 h-8 bg-gray-100 rounded-md"></div></div>
           <div className="w-20 h-8 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!editor) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <div className="relative mb-3">
        <EditorContent editor={editor} className="min-h-[44px]" />
        
        {isUploading && (
          <div className="absolute right-2 bottom-2">
            <span className="text-xs text-gray-400 animate-pulse">上传中...</span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
        <div className="flex gap-1 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
          />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" 
                  onClick={handleImageClick} 
                  disabled={isUploading}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>插入图片/文件</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>加粗</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 ${editor.isActive('codeBlock') ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={handleInsertCode}
                >
                  <Code className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>代码块</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button 
          onClick={handleSubmit} 
          size="sm" 
          className="bg-black hover:bg-gray-800 text-white gap-2 rounded-full px-6 transition-all"
          disabled={!hasContent || isSubmitting || isUploading}
        >
          <Send className="w-3 h-3" />
          {isSubmitting ? "发布中..." : "发布"}
        </Button>
      </div>
    </div>
  );
}
