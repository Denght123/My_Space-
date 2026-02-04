"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfile } from "@/app/space/edit/actions";
import { uploadFile } from "@/app/space/upload-action"; // Import the upload action

export default function EditProfileForm({ config, social }: { config: any, social: any }) {
  const [previewUrl, setPreviewUrl] = useState(config?.avatarUrl || "https://github.com/shadcn.png");
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Upload immediately or wait for submit? 
      // The current flow suggests we just select file and upload on submit OR upload now and store URL.
      // The form expects 'avatarUrl' hidden input.
      // Let's upload now to get the blob URL, which is safer for form submission.
      
      const toastId = toast.loading("头像上传中...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFile(formData);
        
        if (res.error) {
          toast.error(res.error, { id: toastId });
        } else {
          toast.success("头像上传成功", { id: toastId });
          setPreviewUrl(res.url); // Update preview to remote URL
          // We need to update the hidden input value too, or state that controls it
        }
      } catch (err) {
        toast.error("上传失败", { id: toastId });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      // If we uploaded a new avatar, we need to make sure the hidden input 'avatarUrl' has the new URL.
      // But formData.get('avatarUrl') will get the value from the hidden input.
      // The hidden input is uncontrolled: <input type="hidden" name="avatarUrl" value={config?.avatarUrl || ""} />
      // This is problematic if we update previewUrl state but not the hidden input.
      // FIX: Control the hidden input value.
      
      // Override avatarUrl in formData if we have a new previewUrl that starts with http (remote)
      // Actually, easier way: add the updated URL to formData manually if it changed.
      if (previewUrl !== config?.avatarUrl) {
         formData.set('avatarUrl', previewUrl);
      }
      
      const result = await updateProfile(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("保存成功", { 
          duration: 1000,
          style: {
            background: '#000',
            color: '#fff',
            border: 'none'
          }
        });
      }
    } catch (error) {
      toast.error("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <input type="hidden" name="avatarUrl" value={previewUrl} />
      
      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>这些信息将展示在你的个人主页上</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border">
              <AvatarImage src={previewUrl} className="object-cover" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label>头像</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="avatar-upload" 
                  name="avatarFile" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上传头像
                </Button>
                <p className="text-xs text-gray-500">支持 JPG, PNG</p>
              </div>
            </div>
          </div>

          {/* Username & Slogan */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称 / 用户名</Label>
              <Input 
                id="nickname" 
                name="nickname" 
                defaultValue={config?.nickname || ""} 
                placeholder="你的名字" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">所在地</Label>
              <Input 
                id="location" 
                name="location" 
                defaultValue={social.location || ""} 
                placeholder="例如：中国 上海" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">个性签名</Label>
            <Input 
              id="slogan" 
              name="slogan" 
              defaultValue={config?.slogan || ""} 
              placeholder="一句话介绍你自己" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutMe">个人简介</Label>
            <Textarea 
              id="aboutMe" 
              name="aboutMe" 
              defaultValue={config?.aboutMe || ""} 
              placeholder="详细介绍你的经历..." 
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle>社交链接</CardTitle>
          <CardDescription>让访客能更容易联系到你</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <div className="relative">
                <Input 
                  id="github" 
                  name="github" 
                  defaultValue={social.github || ""} 
                  placeholder="https://github.com/username" 
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  name="email" 
                  defaultValue={social.email || ""} 
                  placeholder="mailto:you@example.com" 
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex justify-end gap-4 sticky bottom-6">
        <Link href="/space">
          <Button variant="outline" type="button" className="bg-white/80 backdrop-blur-sm">取消</Button>
        </Link>
        <Button 
          type="submit" 
          className="bg-black hover:bg-gray-800 text-white shadow-lg"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存修改
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
