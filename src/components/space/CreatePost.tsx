"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createPost } from "@/app/space/actions";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Send,
  Paperclip,
  Code,
  Smile
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevText = textarea.value;

    const newText = prevText.substring(0, start) + text + prevText.substring(end);
    setContent(newText);

    // Restore focus and cursor position (after inserted text)
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  const handleInsertCode = () => {
    insertText("\n```\n\n```\n");
    // Move cursor inside code block
    setTimeout(() => {
      if (textareaRef.current) {
        const cursor = textareaRef.current.value.length - 4;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursor;
      }
    }, 0);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Currently just a placeholder for file handling logic
    // In a real app, you might upload immediately to get a URL, or attach to form
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`已选择: ${file.name} (暂不支持直接插入，需后端适配附件)`);
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
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的新鲜事..."
            className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-none overflow-hidden placeholder:text-gray-400 min-h-[44px]"
            disabled={isSubmitting}
            rows={1}
          />
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          <div className="flex gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={handleImageClick}>
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>上传图片</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>添加附件</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={handleInsertCode}>
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>插入代码块</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => insertText("😊")}>
                    <Smile className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>插入表情</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-black hover:bg-gray-800 text-white gap-2 rounded-full px-6 transition-all"
            disabled={!content.trim() || isSubmitting}
          >
            <Send className="w-3 h-3" />
            {isSubmitting ? "发布中..." : "发布"}
          </Button>
        </div>
      </form>
    </div>
  );
}
