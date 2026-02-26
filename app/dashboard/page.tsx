export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import { getPostsByAuthor, getCollaborationsByUser } from "@/lib/queries";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CollabStatusBadge, PostStatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const [myPosts, myCollaborations] = await Promise.all([
    getPostsByAuthor(user.id).catch(() => []),
    getCollaborationsByUser(user.id).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Manage your posts and collaborations.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/posts/new">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* My Posts */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">My Posts ({myPosts.length})</h2>
        </div>

        {myPosts.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-muted-foreground text-sm mb-4">
              You haven&apos;t created any posts yet.
            </p>
            <Button asChild size="sm">
              <Link href="/posts/new">Create your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* My Collaborations */}
      <section>
        <h2 className="text-xl font-semibold mb-5">
          My Collaborations ({myCollaborations.length})
        </h2>

        {myCollaborations.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-muted-foreground text-sm mb-4">
              You haven&apos;t joined any efforts yet.
            </p>
            <Button variant="outline" asChild size="sm">
              <Link href="/browse">Browse posts to join</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {myCollaborations.map((collab) => {
              const post = collab.post as typeof collab.post & { title: string; post_type: string; status: string };
              return (
                <Link
                  key={collab.id}
                  href={`/posts/${collab.post_id}`}
                  className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge
                        variant={post?.post_type === "feature_request" ? "default" : "info"}
                        className="text-xs"
                      >
                        {post?.post_type === "feature_request" ? "Feature Request" : "Research Topic"}
                      </Badge>
                      <CollabStatusBadge status={collab.status} />
                    </div>
                    <p className="font-medium text-sm truncate">{post?.title ?? "Untitled"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Joined {formatRelativeDate(collab.created_at)}
                    </p>
                  </div>
                  <div className="ml-4">
                    {post?.status && <PostStatusBadge status={post.status as "open" | "in_progress" | "completed"} />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
