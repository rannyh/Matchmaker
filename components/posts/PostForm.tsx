"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TagInput } from "@/components/shared/TagInput";
import { MarkdownEditor } from "@/components/shared/MarkdownEditor";
import { createClient } from "@/lib/supabase";
import type { Post, PostType, PostStatus } from "@/lib/types";

interface PostFormProps {
  post?: Post;
  authorId: string;
}

export function PostForm({ post, authorId }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!post;

  const [formData, setFormData] = useState({
    title: post?.title ?? "",
    post_type: post?.post_type ?? ("feature_request" as PostType),
    description: post?.description ?? "",
    tags: post?.tags ?? [],
    skills_required: post?.skills_required ?? [],
    timeline: post?.timeline ?? "",
    has_funding: post?.has_funding ?? false,
    funding_details: post?.funding_details ?? "",
    open_source_project: post?.open_source_project ?? "",
    status: post?.status ?? ("open" as PostStatus),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && post) {
        const { error } = await supabase
          .from("posts")
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq("id", post.id);
        if (error) throw error;
        router.push(`/posts/${post.id}`);
      } else {
        const { data, error } = await supabase
          .from("posts")
          .insert({ ...formData, author_id: authorId })
          .select()
          .single();
        if (error) throw error;
        router.push(`/posts/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      {/* Post Type */}
      <div className="space-y-2">
        <Label htmlFor="post_type">Post Type</Label>
        <Select
          value={formData.post_type}
          onValueChange={(v) =>
            setFormData((d) => ({ ...d, post_type: v as PostType }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feature_request">Feature Request (Industry)</SelectItem>
            <SelectItem value="research_topic">Research Topic (Researcher)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
          placeholder="A clear, descriptive title for your post"
          maxLength={200}
        />
      </div>

      {/* Open Source Project */}
      <div className="space-y-2">
        <Label htmlFor="oss">Open Source Project</Label>
        <Input
          id="oss"
          value={formData.open_source_project}
          onChange={(e) =>
            setFormData((d) => ({ ...d, open_source_project: e.target.value }))
          }
          placeholder="e.g. PyTorch, Kubernetes, React"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description * <span className="text-xs text-muted-foreground font-normal">(Markdown supported)</span></Label>
        <MarkdownEditor
          value={formData.description}
          onChange={(v) => setFormData((d) => ({ ...d, description: v }))}
          placeholder="Describe your feature request or research topic in detail..."
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags <span className="text-xs text-muted-foreground font-normal">(press Enter or comma to add)</span></Label>
        <TagInput
          value={formData.tags}
          onChange={(tags) => setFormData((d) => ({ ...d, tags }))}
          placeholder="e.g. machine-learning, nlp, distributed..."
        />
      </div>

      {/* Skills Required */}
      <div className="space-y-2">
        <Label>Skills Required <span className="text-xs text-muted-foreground font-normal">(press Enter or comma to add)</span></Label>
        <TagInput
          value={formData.skills_required}
          onChange={(skills) => setFormData((d) => ({ ...d, skills_required: skills }))}
          placeholder="e.g. python, cuda, distributed-systems..."
        />
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline</Label>
        <Input
          id="timeline"
          value={formData.timeline}
          onChange={(e) => setFormData((d) => ({ ...d, timeline: e.target.value }))}
          placeholder="e.g. 6 months, Q3 2026, ongoing"
        />
      </div>

      {/* Funding */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="has_funding"
            checked={formData.has_funding}
            onCheckedChange={(checked) =>
              setFormData((d) => ({ ...d, has_funding: !!checked }))
            }
          />
          <Label htmlFor="has_funding" className="cursor-pointer">This project has funding available</Label>
        </div>
        {formData.has_funding && (
          <Input
            value={formData.funding_details}
            onChange={(e) =>
              setFormData((d) => ({ ...d, funding_details: e.target.value }))
            }
            placeholder="Describe funding details (amount, type, conditions)..."
          />
        )}
      </div>

      {/* Status (edit only) */}
      {isEditing && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((d) => ({ ...d, status: v as PostStatus }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || !formData.title || !formData.description}>
          {loading ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
