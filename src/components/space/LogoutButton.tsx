"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/space/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    // After logout, redirect happens on server action
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 gap-2">
          <LogOut className="w-4 h-4" />
          退出登录
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-black border-2 rounded-xl shadow-none sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-black">确认退出登录？</DialogTitle>
          <DialogDescription className="text-gray-500">
            您确定要退出当前账号吗？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-0 hover:bg-gray-100 rounded-lg"
          >
            取消
          </Button>
          <Button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="bg-black text-white hover:bg-gray-800 rounded-lg"
          >
            {isLoggingOut ? "退出中..." : "确认退出"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
