export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { PostForm } from "@/components/posts/PostForm";

export default async function NewPostPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/posts/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Post</h1>
        <p className="text-muted-foreground">
          Share a feature request or research topic with the community.
        </p>
      </div>
      <PostForm authorId={user.id} />
    </div>
  );
}
