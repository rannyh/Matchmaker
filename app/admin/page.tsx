export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getAdminStats, getAllProfiles } from "@/lib/queries";
import { AdminStatsPanel } from "@/components/admin/AdminStats";
import { UserTable } from "@/components/admin/UserTable";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  // Check admin status — stored in user_metadata or a separate admins check
  // For simplicity, we check if user email ends with @admin or metadata flag
  const isAdmin =
    user.user_metadata?.is_admin === true ||
    user.app_metadata?.role === "admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const [stats, users] = await Promise.all([
    getAdminStats().catch(() => ({
      total_users: 0,
      total_researchers: 0,
      total_industry: 0,
      total_posts: 0,
      total_feature_requests: 0,
      total_research_topics: 0,
      active_collaborations: 0,
      verified_users: 0,
    })),
    getAllProfiles().catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Platform analytics and user management.</p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-5">Analytics</h2>
        <AdminStatsPanel stats={stats} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-5">
          Users ({users.length})
        </h2>
        <UserTable users={users} />
      </section>
    </div>
  );
}
