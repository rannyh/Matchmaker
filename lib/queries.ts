import { createServerClient } from "./supabase-server";
import type {
  Post,
  Profile,
  Collaboration,
  Comment,
  PostStatus,
  PostType,
  CollaborationStatus,
  AdminStats,
} from "./types";

// ── Posts ────────────────────────────────────────────────────────────────────

export async function getPosts(opts?: {
  search?: string;
  post_type?: PostType;
  status?: PostStatus;
  tags?: string[];
  skills?: string[];
  has_funding?: boolean;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .order("created_at", { ascending: false });

  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%,description.ilike.%${opts.search}%,open_source_project.ilike.%${opts.search}%`
    );
  }
  if (opts?.post_type) query = query.eq("post_type", opts.post_type);
  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.has_funding !== undefined)
    query = query.eq("has_funding", opts.has_funding);
  if (opts?.tags && opts.tags.length > 0)
    query = query.overlaps("tags", opts.tags);
  if (opts?.skills && opts.skills.length > 0)
    query = query.overlaps("skills_required", opts.skills);
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 10) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data as Post[];
}

export async function getPostById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, author:profiles(*), collaborations(*, user:profiles(*)), comments(*, author:profiles(*))"
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPostsByAuthor(authorId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Post[];
}

// ── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfileById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getAllProfiles() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Profile[];
}

// ── Collaborations ────────────────────────────────────────────────────────────

export async function getCollaborationsByUser(userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select("*, post:posts(*, author:profiles(*))")
    .eq("user_id", userId)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Collaboration[];
}

export async function getCollaborationByUserAndPost(
  userId: string,
  postId: string
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select("*")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data as Collaboration | null;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createServerClient();

  const [usersResult, postsResult, collabsResult] = await Promise.all([
    supabase.from("profiles").select("role, is_verified"),
    supabase.from("posts").select("post_type"),
    supabase
      .from("collaborations")
      .select("status")
      .eq("status", "active"),
  ]);

  const users = usersResult.data ?? [];
  const posts = postsResult.data ?? [];
  const collabs = collabsResult.data ?? [];

  return {
    total_users: users.length,
    total_researchers: users.filter((u) => u.role === "researcher").length,
    total_industry: users.filter((u) => u.role === "industry").length,
    total_posts: posts.length,
    total_feature_requests: posts.filter(
      (p) => p.post_type === "feature_request"
    ).length,
    total_research_topics: posts.filter((p) => p.post_type === "research_topic")
      .length,
    active_collaborations: collabs.length,
    verified_users: users.filter((u) => u.is_verified).length,
  };
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function getCommentsByPost(postId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Comment[];
}
