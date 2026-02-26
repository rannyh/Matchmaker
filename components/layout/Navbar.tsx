"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, LayoutDashboard, PlusCircle, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        if (user.user_metadata?.is_admin) setIsAdmin(true);

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        } else {
          setUser(session.user);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="text-2xl">🔬</span>
            <span className="hidden sm:inline">Matchmaker</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
              Browse
            </Link>
            {user && (
              <>
                <Link href="/posts/new" className="text-muted-foreground hover:text-foreground transition-colors">
                  New Post
                </Link>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={`/profile/${user.id}`}>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 flex flex-col gap-3">
          <Link href="/browse" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Browse</Link>
          {user ? (
            <>
              <Link href="/posts/new" onClick={() => setMobileOpen(false)} className="text-sm font-medium flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> New Post
              </Link>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="text-sm font-medium flex items-center gap-2 text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Log in</Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
