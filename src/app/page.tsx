export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center space-y-4 py-10">
        <h2 className="text-3xl font-bold tracking-tighter">Welcome to MySpace</h2>
        <p className="text-gray-500 max-w-[600px] mx-auto">
          这里是我的个人极简博客。分享技术、生活与思考。
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for blog posts */}
        <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">Hello World</h3>
          <p className="text-gray-500 mb-4">这是第一篇示例文章...</p>
          <span className="text-sm text-gray-400">2024-05-20</span>
        </div>
      </div>
    </div>
  );
}
