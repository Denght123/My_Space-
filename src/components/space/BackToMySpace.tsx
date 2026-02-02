"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackToMySpace({ currentUserId }: { currentUserId: string }) {
  const pathname = usePathname();
  
  // Logic: 
  // 1. Must be in /space/... route
  // 2. Must NOT be /space (root space page)
  // 3. Must NOT be /space/edit
  // 4. (Optional) Check if we are viewing someone else's profile?
  //    Actually, requirement says "When visiting others' homepage".
  //    But simplified: Show whenever we are NOT at "/space".
  
  // Wait, if I am at "/space/Traveler", pathname is "/space/Traveler".
  // If I am at "/space", pathname is "/space".
  
  const isViewingOther = pathname.startsWith("/space/") && pathname !== "/space" && pathname !== "/space/edit";

  if (!isViewingOther) return null;

  return (
    <Link 
      href="/space" 
      className="flex items-center text-sm font-medium text-gray-400 hover:text-black transition-colors pt-1" // Added pt-1 for alignment tweak
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      返回
    </Link>
  );
}
