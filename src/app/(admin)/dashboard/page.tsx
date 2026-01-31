import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Eye } from "lucide-react";

export default async function DashboardPage() {
  // Fetch stats in parallel
  const [postsCount, commentsCount] = await Promise.all([
    db.post.count(),
    db.comment.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Posts" 
          value={postsCount} 
          icon={FileText} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Total Comments" 
          value={commentsCount} 
          icon={MessageSquare} 
          color="text-green-600" 
        />
        {/* Placeholder for views if we add analytics later */}
        <StatCard 
          title="Total Views" 
          value="-" 
          icon={Eye} 
          color="text-purple-600" 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow p-6 text-gray-500 text-center">
          Activity feed coming soon...
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-full bg-gray-100 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}
