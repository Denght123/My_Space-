import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b py-4">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">MySpace</h1>
              <nav className="space-x-4">
                <a href="/" className="hover:underline">首页</a>
                {/* 暂时使用 href 跳转，后续优化为 Link 组件 */}
                <a href="/about" className="hover:underline">关于我</a>
              </nav>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-sm text-gray-500">
            <div className="container mx-auto px-4">
              © {new Date().getFullYear()} MySpace. Built with Next.js & Tailwind.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
