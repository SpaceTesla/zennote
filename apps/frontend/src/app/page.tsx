import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Lock, Zap, Code, Share2 } from '@/components/ui/hugeicons';

export default function Home() {
  return (
    <main className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-primary/10 blur-3xl" />
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl relative">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary ring-1 ring-primary/20">
                <Zap className="h-4 w-4" />
                Nova Amber Theme
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Beautiful Markdown notes,
                <span className="text-primary block">crafted for focus.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Zennote turns messy ideas into polished, shareable knowledge. Real-time preview,
                zero clutter UI, and warm amber accents keep you in flow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/notes">Browse Notes</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border/70 bg-white/60 dark:bg-card/70 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-foreground">4.8/5</p>
                  <p>Creator satisfaction</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-white/60 dark:bg-card/70 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-foreground">Secure</p>
                  <p>Privacy-first sharing</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-white/60 dark:bg-card/70 px-4 py-3 backdrop-blur-sm">
                  <p className="text-2xl font-semibold text-foreground">Realtime</p>
                  <p>Live markdown preview</p>
                </div>
              </div>
            </div>
            <Card className="relative bg-glass-amber shadow-card-ambient border border-border/70">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Preview
                </div>
                <CardTitle className="text-2xl">Zen note canvas</CardTitle>
                <CardDescription>Warm typography, smart spacing, zero noise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6">
                <div className="rounded-xl border border-border/70 bg-white/70 dark:bg-input/30 p-4 shadow-inner">
                  <p className="font-semibold text-lg text-foreground mb-2">Meeting prep</p>
                  <p className="text-muted-foreground">
                    - Agenda bullets with `CheckListIcon`<br />
                    - Decisions highlighted with amber chips<br />
                    - Share instantly with collaborators
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Private by default. Public when you choose.</span>
                </div>
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground">One-click sharing, tailored permissions.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for clarity</h2>
          <p className="text-muted-foreground">
            Everything you need to write, polish, and share knowledge beautifully.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Split-View Editor</CardTitle>
              <CardDescription>
                Write markdown on the left, see a live amber-tinted preview on the right.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <Share2 className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Share notes with teams, manage permissions, and stay in sync.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Private by default with optional public links and granular control.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Fast & Responsive</CardTitle>
              <CardDescription>
                Snappy interactions, soft transitions, and instant previews.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Markdown Mastery</CardTitle>
              <CardDescription>
                Syntax highlighting, toolbar shortcuts, and clean typography.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:-translate-y-[2px] transition">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Profiles & Sharing</CardTitle>
              <CardDescription>
                Showcase public notes, manage collaborators, and build your library.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-4xl">
        <Card className="text-center bg-gradient-to-br from-primary/10 via-white/80 to-amber-100/60 dark:from-primary/10 dark:via-background dark:to-background border border-border/70">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to feel the upgrade?</CardTitle>
            <CardDescription className="text-lg">
              Create your account and start shipping polished notes today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">Sign Up Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
