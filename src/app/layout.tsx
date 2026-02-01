import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MySpace - 个人极简博客",
  description: "一个专注内容的个人展示空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-white text-black antialiased cursor-default`}>
        <div className="min-h-screen flex flex-col">
          <header className="fixed top-0 w-full bg-white z-50">
            <div className="container mx-auto px-6 h-16 flex justify-between items-center">
              <h1 className="text-xl font-bold tracking-tight">
                <Link href="/" className="hover:opacity-70 transition-opacity cursor-pointer">MySpace</Link>
              </h1>
              <nav>
                {/* 顶部右侧登录模块已移除 */}
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
