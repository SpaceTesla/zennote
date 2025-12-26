import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Lock, Zap, Code, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Beautiful Markdown Notes
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, edit, and share beautiful markdown notes with a split-view editor.
            Perfect for developers, writers, and note-takers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/notes">View Notes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground">
            Everything you need to create and manage your notes
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Split-View Editor</CardTitle>
              <CardDescription>
                Write markdown on the left, see live preview on the right
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Share2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Collaboration</CardTitle>
              <CardDescription>
                Share notes with others and collaborate in real-time
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Control who can see your notes with public/private settings
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Fast & Responsive</CardTitle>
              <CardDescription>
                Built for speed with modern web technologies
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Markdown Support</CardTitle>
              <CardDescription>
                Full markdown support with syntax highlighting
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>
                Customize your profile and share your public notes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to get started?</CardTitle>
            <CardDescription className="text-lg">
              Create your account and start taking notes today
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
