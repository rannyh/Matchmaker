"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CollabStatusBadge } from "@/components/shared/StatusBadge";
import { createClient } from "@/lib/supabase";
import { formatRelativeDate } from "@/lib/utils";
import type { Collaboration } from "@/lib/types";

interface CollaboratorListProps {
  postId: string;
  collaborations: Collaboration[];
  currentUserId?: string;
  isPostOwner: boolean;
  postStatus: string;
}

export function CollaboratorList({
  postId,
  collaborations: initialCollabs,
  currentUserId,
  isPostOwner,
  postStatus,
}: CollaboratorListProps) {
  const supabase = createClient();
  const [collabs, setCollabs] = useState(initialCollabs);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserCollab = currentUserId
    ? collabs.find((c) => c.user_id === currentUserId && c.status !== "withdrawn")
    : null;

  const activeCollabs = collabs.filter((c) => c.status !== "withdrawn");

  const handleJoin = async () => {
    if (!currentUserId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("collaborations")
        .upsert({
          post_id: postId,
          user_id: currentUserId,
          message: joinMessage.trim() || null,
          status: "interested",
        })
        .select("*, user:profiles(*)")
        .single();
      if (error) throw error;
      setCollabs((prev) => {
        const filtered = prev.filter((c) => c.user_id !== currentUserId);
        return [...filtered, data as Collaboration];
      });
      setJoinDialogOpen(false);
      setJoinMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!currentUserId || !currentUserCollab) return;
    setLoading(true);
    try {
      await supabase
        .from("collaborations")
        .update({ status: "withdrawn" })
        .eq("id", currentUserCollab.id);
      setCollabs((prev) =>
        prev.map((c) =>
          c.id === currentUserCollab.id ? { ...c, status: "withdrawn" } : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (collabId: string, newStatus: "active" | "interested") => {
    await supabase
      .from("collaborations")
      .update({ status: newStatus })
      .eq("id", collabId);
    setCollabs((prev) =>
      prev.map((c) => (c.id === collabId ? { ...c, status: newStatus } : c))
    );
  };

  const getInitials = (collab: Collaboration) =>
    collab.user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">
          Collaborators ({activeCollabs.length})
        </h3>

        {currentUserId && !isPostOwner && postStatus !== "completed" && (
          currentUserCollab ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWithdraw}
              disabled={loading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <UserMinus className="h-3.5 w-3.5" />
              Withdraw
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setJoinDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Join Effort
            </Button>
          )
        )}
      </div>

      {activeCollabs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No collaborators yet. Be the first to join this effort!
        </p>
      ) : (
        <div className="space-y-3">
          {activeCollabs.map((collab) => (
            <div key={collab.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Link href={`/profile/${collab.user_id}`}>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={collab.user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{getInitials(collab)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/profile/${collab.user_id}`} className="font-medium text-sm hover:underline">
                    {collab.user?.full_name ?? "Unknown"}
                  </Link>
                  {collab.user?.role && (
                    <Badge variant={collab.user.role === "researcher" ? "info" : "default"} className="text-xs">
                      {collab.user.role === "researcher" ? "Researcher" : "Industry"}
                    </Badge>
                  )}
                  <CollabStatusBadge status={collab.status} />
                </div>
                {collab.user?.organization && (
                  <p className="text-xs text-muted-foreground mt-0.5">{collab.user.organization}</p>
                )}
                {collab.message && (
                  <p className="text-sm text-muted-foreground mt-1 italic">"{collab.message}"</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {formatRelativeDate(collab.created_at)}
                </p>
              </div>
              {isPostOwner && collab.status === "interested" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange(collab.id, "active")}
                  className="text-xs"
                >
                  Mark Active
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Join Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join this Effort</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Intro Message (optional)</Label>
            <Textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Briefly describe your interest or relevant background..."
              rows={3}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoin} disabled={loading}>
              {loading ? "Joining..." : "Join Effort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
