"use client";

import { useState } from "react";
import FollowListDialog from "./FollowListDialog";

interface FollowStatsClientProps {
  userId: string;
  followingCount: number;
  followersCount: number;
}

export default function FollowStatsClient({ userId, followingCount, followersCount }: FollowStatsClientProps) {
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 mt-6">
        <h3 className="font-bold text-gray-900">关注与粉丝</h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div 
            className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setShowFollowing(true)}
          >
            <div className="font-bold text-xl text-gray-900">{followingCount}</div>
            <div className="text-xs text-gray-500 mt-1">关注</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-bold text-xl text-gray-900">{followersCount}</div>
            <div className="text-xs text-gray-500 mt-1">粉丝</div>
          </div>
        </div>
      </div>

      <FollowListDialog 
        userId={userId} 
        type="following" 
        isOpen={showFollowing} 
        onOpenChange={setShowFollowing} 
      />
      
      {/* Followers dialog can be added later when API is ready */}
    </>
  );
}
