"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase";
import { formatRelativeDate } from "@/lib/utils";
import type { Comment, Profile } from "@/lib/types";

interface CommentThreadProps {
  postId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

export function CommentThread({
  postId,
  initialComments,
  currentUserId,
}: CommentThreadProps) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          author_id: currentUserId,
          content: newComment.trim(),
        })
        .select("*, author:profiles(*)")
        .single();

      if (error) throw error;
      setComments((prev) => [...prev, data as Comment]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const getInitials = (profile?: Profile | null) =>
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base">
        Comments ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, i) => (
            <div key={comment.id}>
              <div className="flex gap-3">
                <Link href={`/profile/${comment.author_id}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.author?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.author)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      href={`/profile/${comment.author_id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {comment.author?.full_name ?? "Unknown"}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                </div>
                {currentUserId === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {i < comments.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="pt-2 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !newComment.trim()}
            className="gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground pt-2">
          <Link href="/auth/login" className="text-primary hover:underline">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}
    </div>
  );
}
