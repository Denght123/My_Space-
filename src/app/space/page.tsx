import ProfileCard from "@/components/space/ProfileCard";
import PostFeed from "@/components/space/PostFeed";

export default function SpacePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Sidebar (Profile) - 3 cols on desktop, full width on mobile */}
          <div className="md:col-span-4 lg:col-span-3">
            <ProfileCard />
          </div>

          {/* Main Content (Feed) - 9 cols on desktop, full width on mobile */}
          <main className="md:col-span-8 lg:col-span-9">
            <PostFeed />
          </main>
        </div>
      </div>
    </div>
  );
}
