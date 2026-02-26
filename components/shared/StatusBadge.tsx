import { Badge } from "@/components/ui/badge";
import type { PostStatus, CollaborationStatus } from "@/lib/types";

interface PostStatusBadgeProps {
  status: PostStatus;
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const variants: Record<PostStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
    open: { label: "Open", variant: "success" },
    in_progress: { label: "In Progress", variant: "warning" },
    completed: { label: "Completed", variant: "secondary" },
  };

  const { label, variant } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

interface CollabStatusBadgeProps {
  status: CollaborationStatus;
}

export function CollabStatusBadge({ status }: CollabStatusBadgeProps) {
  const variants: Record<CollaborationStatus, { label: string; variant: "info" | "success" | "secondary" }> = {
    interested: { label: "Interested", variant: "info" },
    active: { label: "Active", variant: "success" },
    withdrawn: { label: "Withdrawn", variant: "secondary" },
  };

  const { label, variant } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}
