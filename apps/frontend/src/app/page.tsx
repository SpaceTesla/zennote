import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Users,
  Lock,
  Zap,
  Code,
  Share2,
} from '@/components/ui/hugeicons';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Separator } from '@/components/ui/separator';
import { AmbientGlow } from '@/components/landing/ambient-glow';

export default function Home() {
  return (
    <div className="flex flex-col pb-20 relative overflow-hidden">
      <AmbientGlow />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl relative z-10">
        <div className="flex flex-col items-center space-y-12 relative">
          <div className="text-center space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <Zap className="h-4 w-4" />
              Simple & Clean
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Beautiful Markdown notes,
              <span className="text-primary block">crafted for focus.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Zennote turns messy ideas into polished, shareable knowledge.
              Real-time preview, zero clutter UI, and a clean design keep you in
              flow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Button
                render={<Link href="/register">Get Started</Link>}
                size="lg"
              />
              <Button
                render={<Link href="/notes/anonymous">Create Anonymous Note</Link>}
                variant="outline"
                size="lg"
              />
              <Button
                render={<Link href="/notes">Browse Notes</Link>}
                variant="outline"
                size="lg"
              />
            </div>
          </div>

          <ScrollReveal className="w-full max-w-2xl">
            <Card className="w-full card-frosted">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Preview
                </div>
                <CardTitle className="text-2xl">Zen note canvas</CardTitle>
                <CardDescription>
                  Clean typography, smart spacing, zero noise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="font-semibold text-lg text-foreground mb-2">
                    Meeting prep
                  </p>
                  <p className="text-muted-foreground">
                    - Agenda bullets with `CheckListIcon`
                    <br />
                    - Decisions highlighted
                    <br />- Share instantly with collaborators
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-foreground">
                    Private by default. Public when you choose.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-primary" />
                  <span className="text-foreground">
                    One-click sharing, tailored permissions.
                  </span>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-muted-foreground w-full max-w-2xl">
            <div className="rounded-lg border bg-card px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-foreground">4.8/5</p>
              <p>Creator satisfaction</p>
            </div>
            <div className="rounded-lg border bg-card px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-foreground">Secure</p>
              <p>Privacy-first sharing</p>
            </div>
            <div className="rounded-lg border bg-card px-4 py-3 text-center sm:col-span-1 col-span-2">
              <p className="text-2xl font-semibold text-foreground">Realtime</p>
              <p>Live markdown preview</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4">
        <Separator className="opacity-10" />
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 max-w-6xl space-y-8 py-24">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for clarity
          </h2>
          <p className="text-muted-foreground">
            Everything you need to write, polish, and share knowledge
            beautifully.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Split-View Editor</CardTitle>
              <CardDescription>
                Write markdown on the left, see a live preview on the right.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Share2 className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Share notes with teams, manage permissions, and stay in sync.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Private by default with optional public links and granular
                control.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Fast & Responsive</CardTitle>
              <CardDescription>
                Snappy interactions, smooth transitions, and instant previews.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Markdown Mastery</CardTitle>
              <CardDescription>
                Syntax highlighting, toolbar shortcuts, and clean typography.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-3" />
              <CardTitle>Profiles & Sharing</CardTitle>
              <CardDescription>
                Showcase public notes, manage collaborators, and build your
                library.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4">
        <Separator className="opacity-10" />
      </div>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-4xl py-24">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-lg">
              Create your account and start shipping polished notes today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                render={<Link href="/register">Sign Up Free</Link>}
                size="lg"
              />
              <Button
                render={<Link href="/login">Sign In</Link>}
                variant="outline"
                size="lg"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
