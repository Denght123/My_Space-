"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createPost } from "@/app/space/actions";
import { uploadFile } from "@/app/space/upload-action";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Send,
  Paperclip,
  Code,
  X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreatePost({ user, authorName, avatarUrl }: { user: any, authorName: string, avatarUrl?: string | null }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const insertText = (text: string, cursorOffset = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevText = textarea.value;

    const newText = prevText.substring(0, start) + text + prevText.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length + cursorOffset;
    }, 0);
  };

  const handleInsertCode = () => {
    insertText("\n```\n\n```\n", -4); // Move cursor inside
  };

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
        toast.success("上传成功", { id: toastId });
        // Check if image or file
        if (file.type.startsWith("image/")) {
          insertText(`\n![${file.name}](${res.url})\n`);
        } else {
          insertText(`\n[📎 ${file.name}](${res.url})\n`);
        }
      }
    } catch (err) {
      toast.error("上传出错", { id: toastId });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的新鲜事... (支持 Markdown)"
            className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-none overflow-hidden placeholder:text-gray-400 min-h-[44px]"
            disabled={isSubmitting}
            rows={1}
          />
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
              // Accept images and common docs
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={handleImageClick} disabled={isUploading}>
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>插入图片/文件</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={handleInsertCode}>
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>插入代码块</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-black hover:bg-gray-800 text-white gap-2 rounded-full px-6 transition-all"
            disabled={!content.trim() || isSubmitting || isUploading}
          >
            <Send className="w-3 h-3" />
            {isSubmitting ? "发布中..." : "发布"}
          </Button>
        </div>
      </form>
    </div>
  );
}
