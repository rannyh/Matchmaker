export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/PostCard";
import { PostFilters } from "@/components/posts/PostFilters";
import { getPosts } from "@/lib/queries";
import type { PostType, PostStatus } from "@/lib/types";

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    funded?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let error: string | null = null;

  try {
    posts = await getPosts({
      search: params.q,
      post_type: params.type as PostType | undefined,
      status: params.status as PostStatus | undefined,
      has_funding: params.funded === "true" ? true : undefined,
      limit,
      offset,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load posts";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Posts</h1>
        <p className="text-muted-foreground">
          Discover feature requests and research topics from the community.
        </p>
      </div>

      <Suspense>
        <PostFilters />
      </Suspense>

      <div className="mt-8">
        {error ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive p-4 text-sm">
            {error}. Please check your Supabase configuration.
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg mb-2">No posts found</h3>
            <p className="text-sm">
              Try adjusting your filters or{" "}
              <a href="/posts/new" className="text-primary hover:underline">
                create the first post
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
              {params.q ? ` for "${params.q}"` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {(posts.length === limit || page > 1) && (
              <div className="flex justify-center gap-3 mt-10">
                {page > 1 && (
                  <a
                    href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                    className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
                  >
                    ← Previous
                  </a>
                )}
                {posts.length === limit && (
                  <a
                    href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                    className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
