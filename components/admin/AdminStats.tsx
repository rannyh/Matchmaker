import { Users, FileText, GitFork, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStats } from "@/lib/types";

interface AdminStatsProps {
  stats: AdminStats;
}

export function AdminStatsPanel({ stats }: AdminStatsProps) {
  const cards = [
    {
      label: "Total Users",
      value: stats.total_users,
      sub: `${stats.total_researchers} researchers · ${stats.total_industry} industry`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Total Posts",
      value: stats.total_posts,
      sub: `${stats.total_feature_requests} feature requests · ${stats.total_research_topics} research topics`,
      icon: FileText,
      color: "text-purple-500",
    },
    {
      label: "Active Collaborations",
      value: stats.active_collaborations,
      sub: "Confirmed active collaborators",
      icon: GitFork,
      color: "text-green-500",
    },
    {
      label: "Verified Users",
      value: stats.verified_users,
      sub: `${Math.round((stats.verified_users / Math.max(stats.total_users, 1)) * 100)}% of total users`,
      icon: BadgeCheck,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
