import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import { auth } from "@/auth";
import UserSearch from "@/components/space/UserSearch";
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
            <div className="container mx-auto px-6 h-16 flex justify-between items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight shrink-0">
                <Link href={session ? "/space" : "/"} className="hover:opacity-70 transition-opacity cursor-pointer">MySpace</Link>
              </h1>
              
              {/* Search Bar - Center/Right aligned */}
              {session && (
                <div className="flex-1 max-w-md mx-4 hidden sm:block">
                  <UserSearch />
                </div>
              )}

              <nav className="shrink-0 flex items-center gap-4">
                {/* Mobile Search Icon could go here */}
                {!session && (
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
