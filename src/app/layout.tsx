import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { auth } from "@/auth";
import UserSearch from "@/components/space/UserSearch";
import BackToMySpace from "@/components/space/BackToMySpace";
import NotificationDropdown from "@/components/space/NotificationDropdown";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MySpace - 个人极简博客",
  description: "一个专注内容的个人展示空间",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-white text-black antialiased cursor-default`}>
        <div className="min-h-screen flex flex-col">
          <header className="fixed top-0 w-full bg-white z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  <Link href={session ? "/space" : "/"} className="hover:opacity-70 transition-opacity cursor-pointer">MySpace</Link>
                </h1>
                
                {/* "Back to My Space" Button - Only for logged in users */}
                {session?.user?.id && <BackToMySpace currentUserId={session.user.id} />}
              </div>
              
              {/* Search Bar - Flexible width - Strictly conditional */}
              {session?.user ? (
                <div className="flex-1 mx-2 w-full sm:max-w-md min-w-0">
                  <UserSearch />
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <nav className="shrink-0 flex items-center gap-2 sm:gap-4">
                {/* Notification Bell - Only for logged in users */}
                {session && <NotificationDropdown />}

                {session ? (
                  <Link 
                    href="/space/MySpace官方"
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 hover:scale-110 transition-all duration-300 whitespace-nowrap"
                  >
                    联系我们
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="text-sm font-medium hover:text-gray-500 transition-colors cursor-pointer"
                  >
                    登录
                  </Link>
                )}
              </nav>
            </div>
          </header>
          {/* pt-16 是为了给 fixed header 留出空间 */}
          <main className="flex-1 pt-16">
            {children}
          </main>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
