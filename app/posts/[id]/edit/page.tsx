export const dynamic = "force-dynamic";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getPostById } from "@/lib/queries";
import { PostForm } from "@/components/posts/PostForm";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/posts/${id}/edit`);
  }

  let post;
  try {
    post = await getPostById(id);
  } catch {
    notFound();
  }

  if (!post) notFound();
  if (post.author_id !== user.id) {
    redirect(`/posts/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
        <p className="text-muted-foreground">Update your post details.</p>
      </div>
      <PostForm post={post} authorId={user.id} />
    </div>
  );
}
