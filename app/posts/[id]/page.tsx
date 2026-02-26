export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, DollarSign, Code2, Tag, Edit } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import { getPostById } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostStatusBadge } from "@/components/shared/StatusBadge";
import { CommentThread } from "@/components/posts/CommentThread";
import { CollaboratorList } from "@/components/posts/CollaboratorList";
import { formatDate } from "@/lib/utils";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  let post;
  try {
    post = await getPostById(id);
  } catch {
    notFound();
  }

  if (!post) notFound();

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isOwner = user?.id === post.author_id;
  const isFeatureRequest = post.post_type === "feature_request";

  const authorInitials =
    post.author?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={isFeatureRequest ? "default" : "info"}>
                {isFeatureRequest ? "Feature Request" : "Research Topic"}
              </Badge>
              <PostStatusBadge status={post.status} />
              {post.has_funding && (
                <Badge variant="success" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Funded
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Posted {formatDate(post.created_at)}</span>
              </div>
              {post.timeline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Timeline: {post.timeline}</span>
                </div>
              )}
              {post.open_source_project && (
                <div className="flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{post.open_source_project}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                <Tag className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                {post.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Skills */}
            {post.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground mt-0.5">Skills:</span>
                {post.skills_required.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {/* Funding details */}
            {post.has_funding && post.funding_details && (
              <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm">
                <span className="font-medium text-green-800 dark:text-green-300">Funding available: </span>
                <span className="text-green-700 dark:text-green-400">{post.funding_details}</span>
              </div>
            )}

            {isOwner && (
              <div className="mt-4">
                <Button size="sm" variant="outline" asChild className="gap-2">
                  <Link href={`/posts/${post.id}/edit`}>
                    <Edit className="h-3.5 w-3.5" /> Edit Post
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Description</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.description}
              </ReactMarkdown>
            </div>
          </div>

          <Separator />

          {/* Collaborators */}
          <CollaboratorList
            postId={post.id}
            collaborations={post.collaborations ?? []}
            currentUserId={user?.id}
            isPostOwner={isOwner}
            postStatus={post.status}
          />

          <Separator />

          {/* Comments */}
          <CommentThread
            postId={post.id}
            initialComments={post.comments ?? []}
            currentUserId={user?.id}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Author card */}
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold text-sm mb-3">Posted by</h3>
            <Link
              href={`/profile/${post.author_id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author?.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm">{authorInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.author?.full_name ?? "Unknown"}</p>
                {post.author?.organization && (
                  <p className="text-xs text-muted-foreground">{post.author.organization}</p>
                )}
                {post.author?.role && (
                  <Badge
                    variant={post.author.role === "researcher" ? "info" : "default"}
                    className="mt-1 text-xs"
                  >
                    {post.author.role === "researcher" ? "Researcher" : "Industry"}
                  </Badge>
                )}
              </div>
            </Link>
            {post.author?.contact_email && (
              <a
                href={`mailto:${post.author.contact_email}`}
                className="mt-3 block text-xs text-primary hover:underline"
              >
                {post.author.contact_email}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-xl border p-4 space-y-3 text-sm">
            <h3 className="font-semibold">Post Summary</h3>
            <div className="flex justify-between text-muted-foreground">
              <span>Collaborators</span>
              <span className="font-medium text-foreground">
                {(post.collaborations ?? []).filter((c: { status: string }) => c.status !== "withdrawn").length}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Comments</span>
              <span className="font-medium text-foreground">
                {(post.comments ?? []).length}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Status</span>
              <PostStatusBadge status={post.status} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
