"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export default function PasswordChangeDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有字段", {
        duration: 1500,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("两次新密码输入不一致", {
        duration: 1500,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error("新密码至少 6 位", {
        duration: 1500,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "修改失败");
      }

      toast.success("密码修改成功", {
        duration: 1500,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
      
      setOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "修改失败";
      toast.error(msg, {
        duration: 1500,
        style: { background: '#000', color: '#fff', border: 'none' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-gray-600">
          <Lock className="mr-2 h-4 w-4" />
          修改密码
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            为了安全起见，修改密码需要验证您的当前密码。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current">当前密码</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new">新密码</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">确认新密码</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleUpdatePassword} 
            disabled={isLoading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? "提交中..." : "确认修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
