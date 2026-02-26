"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "researcher" as UserRole,
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert profile with role and other info
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: formData.full_name,
        role: formData.role,
        organization: formData.organization,
        contact_email: formData.email,
      });
    }

    setLoading(false);

    // If email confirmation is disabled, a session is returned immediately
    if (data.session) {
      router.push("/profile/edit");
      router.refresh();
    } else {
      // Confirmation email was sent
      setSuccess(true);
    }
  };

  if (success && !supabase) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/ocudu_color.svg" alt="OCUDU" height={36} width={230} priority />
          </div>
          <CardTitle className="text-2xl">Join OCUDU</CardTitle>
          <CardDescription>Connect with researchers and industry partners</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✉️</div>
              <h3 className="font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{formData.email}</strong>.
                Click it to activate your account.
              </p>
              <Button variant="outline" asChild>
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData((d) => ({ ...d, full_name: e.target.value }))}
                  placeholder="Dr. Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                  placeholder="you@university.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                />
              </div>

              {/* Role picker */}
              <div className="space-y-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["researcher", "industry"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData((d) => ({ ...d, role }))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                        formData.role === role
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">
                        {role === "researcher" ? "🎓" : "🏢"}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {role === "researcher" ? "Researcher" : "Industry Member"}
                      </span>
                      <span className="text-xs text-muted-foreground text-center">
                        {role === "researcher"
                          ? "Academic or independent researcher"
                          : "Company or organization"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData((d) => ({ ...d, organization: e.target.value }))}
                  placeholder={
                    formData.role === "researcher"
                      ? "MIT, Stanford, Independent..."
                      : "Google, Acme Corp..."
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          {!success && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
