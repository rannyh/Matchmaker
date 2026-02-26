"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase";
import type { Profile, UserRole } from "@/lib/types";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? "",
    role: profile.role ?? ("researcher" as UserRole),
    organization: profile.organization ?? "",
    bio: profile.bio ?? "",
    contact_email: profile.contact_email ?? "",
    avatar_url: profile.avatar_url ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", profile.id);

      if (error) throw error;
      setSuccess(true);
      router.refresh();
      setTimeout(() => router.push(`/profile/${profile.id}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 text-green-800 p-3 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData((d) => ({ ...d, full_name: e.target.value }))}
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Select
          value={formData.role}
          onValueChange={(v) => setFormData((d) => ({ ...d, role: v as UserRole }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="industry">Industry Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => setFormData((d) => ({ ...d, organization: e.target.value }))}
          placeholder="University or company name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData((d) => ({ ...d, bio: e.target.value }))}
          placeholder="Tell others about your research interests or industry focus..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Public Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => setFormData((d) => ({ ...d, contact_email: e.target.value }))}
          placeholder="Publicly visible for collaboration inquiries"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input
          id="avatar_url"
          type="url"
          value={formData.avatar_url}
          onChange={(e) => setFormData((d) => ({ ...d, avatar_url: e.target.value }))}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
