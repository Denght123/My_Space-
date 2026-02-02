"use client";

import { Copy, Github, Mail } from "lucide-react";
import { toast } from "sonner";

interface CopyableItemProps {
  icon: "github" | "email";
  value: string | null | undefined;
  label: string;
}

export default function CopyableItem({ icon, value, label }: CopyableItemProps) {
  if (!value) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label}已复制`);
  };

  const Icon = icon === "github" ? Github : Mail;

  return (
    <div 
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer group transition-colors"
      onClick={handleCopy}
      title={`点击复制: ${value}`}
    >
      <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
      <span className="truncate max-w-[200px]">{value}</span>
      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
    </div>
  );
}
