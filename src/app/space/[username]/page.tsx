import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProfileCard from "@/components/space/ProfileCard";
import PostFeed from "@/components/space/PostFeed";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const resolvedParams = await params;
  // Decode username from URL (it might be encoded)
  const username = decodeURIComponent(resolvedParams.username);
  
  // Exclude 'edit' from being treated as a username
  if (username === 'edit') {
    notFound();
  }

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Sidebar (Profile) */}
          <div className="md:col-span-4 lg:col-span-3">
            <ProfileCard userId={user.id} />
          </div>

          {/* Main Content (Feed) */}
          <main className="md:col-span-8 lg:col-span-9">
            <PostFeed userId={user.id} />
          </main>
        </div>
      </div>
    </div>
  );
}
