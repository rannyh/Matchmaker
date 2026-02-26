import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="mb-3">
              <Image src="/ocudu_color.svg" alt="OCUDU" height={24} width={153} />
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting academic researchers with industry to advance open source.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/browse" className="hover:text-foreground">Browse Posts</Link></li>
              <li><Link href="/posts/new" className="hover:text-foreground">Create Post</Link></li>
              <li><Link href="/auth/signup" className="hover:text-foreground">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/login" className="hover:text-foreground">Log In</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link href="/profile/edit" className="hover:text-foreground">Edit Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OCUDU. Built for the research community.
        </div>
      </div>
    </footer>
  );
}
