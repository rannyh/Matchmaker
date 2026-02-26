import Link from "next/link";
import { Calendar, Tag, DollarSign, Users, Code2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostStatusBadge } from "@/components/shared/StatusBadge";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type { Post } from "@/lib/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const isFeatureRequest = post.post_type === "feature_request";
  const author = post.author;

  const initials = author?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant={isFeatureRequest ? "default" : "info"}>
                {isFeatureRequest ? "Feature Request" : "Research Topic"}
              </Badge>
              <PostStatusBadge status={post.status} />
              {post.has_funding && (
                <Badge variant="success" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Funded
                </Badge>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-base mt-2 line-clamp-2">{post.title}</h3>
          {post.open_source_project && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Code2 className="h-3 w-3" />
              <span>{post.open_source_project}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncate(post.description, 200)}
          </p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span>{author?.full_name ?? "Unknown"}</span>
            {author?.is_verified && (
              <span className="text-blue-500" title="Verified">✓</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatRelativeDate(post.created_at)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
