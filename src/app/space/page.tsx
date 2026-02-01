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

          {/* Main Content (Feed) - 9 cols (Expanded) */}
          <main className="lg:col-span-9">
            <PostFeed />
          </main>
        </div>
      </div>
    </div>
  );
}
