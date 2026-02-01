import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] animate-in fade-in duration-1000 fill-mode-forwards">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <h1 className="text-4xl font-bold tracking-tight text-black sm:text-6xl">
          Welcome to MySpace
        </h1>
        
        <p className="text-xl text-gray-600 font-light tracking-wide">
          这里是个人极简博客。
          <br className="hidden sm:block" />
          分享技术，生活与思考。
        </p>

        <div className="pt-8">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-medium text-white bg-black hover:scale-110 transition-transform duration-300 cursor-pointer min-w-[120px]"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  );
}
