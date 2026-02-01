import ProfileCard from "@/components/space/ProfileCard";
import PostFeed from "@/components/space/PostFeed";

export default function SpacePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Profile) - 3 cols */}
          <div className="lg:col-span-3">
            <ProfileCard />
          </div>

          {/* Main Content (Feed) - 6 cols */}
          <main className="lg:col-span-6">
            <PostFeed />
          </main>

          {/* Right Sidebar (Widgets) - 3 cols */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Project Widget */}
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">精选项目</h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-2 group-hover:opacity-90 transition-opacity" />
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      Personal Blog System
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Next.js 14, Tailwind, Prisma
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
