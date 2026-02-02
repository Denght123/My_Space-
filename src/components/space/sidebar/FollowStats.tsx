import { db } from "@/lib/db";
import FollowStatsClient from "./FollowStatsClient";

interface FollowStatsProps {
  userId: string;
}

export default async function FollowStats({ userId }: FollowStatsProps) {
  const [followingCount, followersCount] = await Promise.all([
    db.follow.count({ where: { followerId: userId } }),
    db.follow.count({ where: { followingId: userId } }),
  ]);

  return (
    <FollowStatsClient 
      userId={userId} 
      followingCount={followingCount} 
      followersCount={followersCount} 
    />
  );
}
