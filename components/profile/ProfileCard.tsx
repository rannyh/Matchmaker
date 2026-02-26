import Link from "next/link";
import { MapPin, Mail, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { truncate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface ProfileCardProps {
  profile: Profile;
  showEditButton?: boolean;
}

export function ProfileCard({ profile, showEditButton }: ProfileCardProps) {
  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center gap-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-1.5 justify-center">
              <h2 className="font-semibold text-lg">{profile.full_name ?? "Anonymous"}</h2>
              {profile.is_verified && (
                <span title="Verified"><BadgeCheck className="h-5 w-5 text-blue-500" /></span>
              )}
            </div>
            {profile.role && (
              <Badge
                variant={profile.role === "researcher" ? "info" : "default"}
                className="mt-1"
              >
                {profile.role === "researcher" ? "Researcher" : "Industry"}
              </Badge>
            )}
          </div>

          {profile.organization && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{profile.organization}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center">
              {truncate(profile.bio, 150)}
            </p>
          )}

          {profile.contact_email && (
            <a
              href={`mailto:${profile.contact_email}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              {profile.contact_email}
            </a>
          )}

          {showEditButton && (
            <Button variant="outline" size="sm" asChild className="mt-2">
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
