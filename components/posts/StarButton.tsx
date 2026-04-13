"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import type { PostStar } from "@/lib/types";

interface StarButtonProps {
  postId: string;
  stars: PostStar[];
  currentUserId?: string;
}

export function StarButton({ postId, stars, currentUserId }: StarButtonProps) {
  const [localStars, setLocalStars] = useState<PostStar[]>(stars);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const hasStarred = currentUserId
    ? localStars.some((s) => s.user_id === currentUserId)
    : false;

  const researcherStars = localStars.filter((s) => s.user?.role === "researcher");
  const industryStars = localStars.filter((s) => s.user?.role === "industry");

  async function toggle() {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/star`, { method: "POST" });
      const json = await res.json();
      if (json.starred) {
        // Optimistically add — full profile not available, so just add stub
        setLocalStars((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            post_id: postId,
            user_id: currentUserId,
            created_at: new Date().toISOString(),
            user: undefined,
          },
        ]);
      } else {
        setLocalStars((prev) => prev.filter((s) => s.user_id !== currentUserId));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Star button + counts */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          disabled={loading || !currentUserId}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors
            ${hasStarred
              ? "border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
          title={currentUserId ? (hasStarred ? "Unstar" : "Star this post") : "Sign in to star"}
        >
          <Star className={`h-4 w-4 ${hasStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
          {hasStarred ? "Starred" : "Star"}
        </button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span title="Researcher stars" className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />
            <span className="font-medium text-foreground">{researcherStars.length}</span>
            <span>researcher{researcherStars.length !== 1 ? "s" : ""}</span>
          </span>
          <span className="text-border">·</span>
          <span title="Industry stars" className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
            <span className="font-medium text-foreground">{industryStars.length}</span>
            <span>industry</span>
          </span>
        </div>
      </div>

      {/* Who starred toggle */}
      {localStars.length > 0 && (
        <div>
          <button
            onClick={() => setShowList((v) => !v)}
            className="text-xs text-primary hover:underline"
          >
            {showList ? "Hide" : "See who starred this"}
          </button>

          {showList && (
            <div className="mt-2 space-y-2">
              {localStars.map((star) => {
                const name = star.user?.full_name ?? "Unknown";
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const isResearcher = star.user?.role === "researcher";

                return (
                  <div key={star.id} className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={star.user?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{name}</span>
                    {star.user?.role && (
                      <Badge
                        variant={isResearcher ? "info" : "default"}
                        className="text-xs px-1.5 py-0"
                      >
                        {isResearcher ? "Researcher" : "Industry"}
                      </Badge>
                    )}
                    {star.user?.contact_email && (
                      <a
                        href={`mailto:${star.user.contact_email}`}
                        className="ml-auto text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Contact
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground ml-1">
                      {formatRelativeDate(star.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
