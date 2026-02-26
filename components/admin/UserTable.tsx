"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface UserTableProps {
  users: Profile[];
}

export function UserTable({ users: initialUsers }: UserTableProps) {
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);

  const handleVerifyToggle = async (userId: string, newValue: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: newValue })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: newValue } : u))
      );
    }
  };

  const getInitials = (user: Profile) =>
    user.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verified</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/profile/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.full_name ?? "—"}
                    </Link>
                    {user.contact_email && (
                      <p className="text-xs text-muted-foreground">{user.contact_email}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {user.role ? (
                  <Badge variant={user.role === "researcher" ? "info" : "default"}>
                    {user.role === "researcher" ? "Researcher" : "Industry"}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {user.organization ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.is_verified}
                    onCheckedChange={(v) => handleVerifyToggle(user.id, v)}
                  />
                  {user.is_verified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
}
