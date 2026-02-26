export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getProfileById, getPostsByAuthor } from "@/lib/queries";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { PostCard } from "@/components/posts/PostCard";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  let profile;
  try {
    profile = await getProfileById(id);
  } catch {
    notFound();
  }

  if (!profile) notFound();

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  let posts: Awaited<ReturnType<typeof getPostsByAuthor>> = [];
  try {
    posts = await getPostsByAuthor(id);
  } catch {
    // ignore
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <aside>
          <ProfileCard profile={profile} showEditButton={isOwnProfile} />
        </aside>

        {/* Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6">
            {isOwnProfile ? "Your Posts" : `Posts by ${profile.full_name ?? "this user"}`}
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-sm">No posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
