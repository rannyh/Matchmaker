export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getProfileById } from "@/lib/queries";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function EditProfilePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile/edit");
  }

  let profile;
  try {
    profile = await getProfileById(user.id);
  } catch {
    // Profile might not exist yet (new user) — create a stub
    profile = {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? null,
      role: null,
      organization: null,
      bio: null,
      contact_email: user.email ?? null,
      avatar_url: null,
      is_verified: false,
      created_at: new Date().toISOString(),
    };
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">
          Tell the community who you are and what you work on.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
