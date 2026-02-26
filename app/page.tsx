import Link from "next/link";
import { ArrowRight, GitFork, Users, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/PostCard";
import { getPosts } from "@/lib/queries";

export default async function HomePage() {
  let recentPosts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    recentPosts = await getPosts({ limit: 6 });
  } catch {
    // Gracefully handle missing Supabase config during development
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-6xl mb-6">🔬</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Where Research Meets{" "}
            <span className="text-primary">Open Source</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect academic researchers with industry partners to collaborate on
            open source projects. Post feature requests, explore research topics,
            and build together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse" className="gap-2">
                Browse Posts <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">Join as Researcher or Industry</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Post Your Idea",
                description:
                  "Researchers post research topics; industry posts feature requests for OSS projects.",
              },
              {
                icon: Users,
                title: "Find Collaborators",
                description:
                  "Anyone can discover posts and express interest in joining the effort.",
              },
              {
                icon: GitFork,
                title: "Collaborate Openly",
                description:
                  "Multiple contributors can join the same effort — no gates, fully open.",
              },
              {
                icon: Zap,
                title: "Track Progress",
                description:
                  "Update post status from Open → In Progress → Completed as work advances.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3 p-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Recent Posts</h2>
              <Button variant="outline" asChild>
                <Link href="/browse" className="gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to collaborate?</h2>
          <p className="text-primary-foreground/80 mb-6">
            Join the community connecting academia and industry through open source.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
