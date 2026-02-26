export type UserRole = "researcher" | "industry";
export type PostType = "feature_request" | "research_topic";
export type PostStatus = "open" | "in_progress" | "completed";
export type CollaborationStatus = "interested" | "active" | "withdrawn";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole | null;
  organization: string | null;
  bio: string | null;
  contact_email: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  post_type: PostType;
  title: string;
  description: string;
  tags: string[];
  skills_required: string[];
  timeline: string | null;
  has_funding: boolean;
  funding_details: string | null;
  open_source_project: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Collaboration {
  id: string;
  post_id: string;
  user_id: string;
  message: string | null;
  status: CollaborationStatus;
  created_at: string;
  user?: Profile;
  post?: Post;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface PostWithDetails extends Post {
  author: Profile;
  collaborations: Collaboration[];
  comments: Comment[];
}

export interface AdminStats {
  total_users: number;
  total_researchers: number;
  total_industry: number;
  total_posts: number;
  total_feature_requests: number;
  total_research_topics: number;
  active_collaborations: number;
  verified_users: number;
}
