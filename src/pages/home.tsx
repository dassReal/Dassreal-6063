import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { siteConfig } from "@/config";
import {
  Lightbulb,
  Users,
  Vote,
  DollarSign,
  GraduationCap,
  Rocket,
  Sparkles,
  FlaskConical,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-muted/20 px-4 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              {siteConfig.site.name}
            </h1>
            <p className="mb-4 text-xl text-muted-foreground md:text-2xl">
              {siteConfig.site.tagline}
            </p>
            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
              Transform your original ideas into income, collaborate on
              cutting-edge material science innovations, and build thriving
              community workshops. A platform for dreamers, creators, and late
              bloomers.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/explore">
                  <Rocket className="mr-2 h-5 w-5" />
                  Explore Ideas
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/nft-studio">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create NFT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Platform Features
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Everything you need to turn ideas into reality and connect with
              like-minded innovators
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                NFT Creation Studio
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Generate unique NFTs from your original ideas and learn proven
                strategies to monetize your creative work.
              </p>
              <Link
                href="/nft-studio"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Create NFT
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Material Science Directory
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Browse categorized innovations in material science, with AI and
                human collaboration on breakthrough ideas.
              </p>
              <Link
                href="/material-science"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Explore Science
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Innovation Hub
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Submit and collaborate on innovative ideas across specific
                field categories with AI assistance.
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Browse Ideas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Community Voting
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Vote on promising ideas and help the community identify the
                most impactful innovations.
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Vote Now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Crowdfunding
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Support innovative projects through crowdfunding and help bring
                breakthrough ideas to life.
              </p>
              <Link
                href="/ideas"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Fund Projects
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="group border-border bg-card p-6 transition-all hover:border-primary/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Community Groups
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Join local groups, find workshops in your area, and create
                consortiums for community innovation centers.
              </p>
              <Link
                href="/groups"
                className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Find Groups
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <img
                src="/nft-example.png"
                alt="NFT Creation Example"
                className="rounded-lg border border-border shadow-lg"
              />
            </div>
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="mr-2 h-4 w-4" />
                NFT Studio
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Turn Your Ideas Into Digital Assets
              </h2>
              <p className="mb-6 text-muted-foreground">
                Generate unique NFTs from your original concepts and learn
                proven monetization strategies. Our platform guides you through
                the entire process, from creation to market success.
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start">
                  <TrendingUp className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Learn income generation strategies from successful creators
                  </span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    AI-powered NFT generation tools
                  </span>
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Share and showcase your work to the community
                  </span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/nft-studio">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <FlaskConical className="mr-2 h-4 w-4" />
                Material Science
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Collaborate on Scientific Breakthroughs
              </h2>
              <p className="mb-6 text-muted-foreground">
                Access our comprehensive directory of material science
                innovations. Collaborate with AI and fellow researchers to
                develop groundbreaking solutions in categorized fields.
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start">
                  <FlaskConical className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Organized by scientific categories and research areas
                  </span>
                </li>
                <li className="flex items-start">
                  <Lightbulb className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    AI-assisted innovation and idea generation
                  </span>
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Connect with researchers and innovators worldwide
                  </span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/material-science">Explore Directory</Link>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/material-science.png"
                alt="Material Science Directory"
                className="rounded-lg border border-border shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <img
                src="/community-workshop.png"
                alt="Community Workshops"
                className="rounded-lg border border-border shadow-lg"
              />
            </div>
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Users className="mr-2 h-4 w-4" />
                Community
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Build Local Innovation Centers
              </h2>
              <p className="mb-6 text-muted-foreground">
                Find and join community groups in your area. Connect with local
                makers, form consortiums, and establish collaborative workshop
                spaces for hands-on learning and creation.
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start">
                  <Users className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Discover groups and workshops in your surrounding area
                  </span>
                </li>
                <li className="flex items-start">
                  <GraduationCap className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Access education and mentorship for all skill levels
                  </span>
                </li>
                <li className="flex items-start">
                  <Rocket className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Perfect for late bloomers seeking new creative outlets
                  </span>
                </li>
              </ul>
              <Button asChild size="lg">
                <Link href="/groups">Find Your Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <GraduationCap className="mr-2 h-4 w-4" />
                Education
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Education for Everyone
              </h2>
              <p className="mb-6 text-muted-foreground">
                Whether you're just starting or discovering new passions later
                in life, our platform provides educational resources and support
                for all learners. No experience required—just curiosity and
                dedication.
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start">
                  <GraduationCap className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Beginner-friendly tutorials and guides
                  </span>
                </li>
                <li className="flex items-start">
                  <Users className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Mentorship from experienced community members
                  </span>
                </li>
                <li className="flex items-start">
                  <Rocket className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Empowering late bloomers to discover and develop new skills
                  </span>
                </li>
              </ul>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Start Learning</Link>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/innovation-concept.png"
                alt="Innovation and Education"
                className="rounded-lg border border-border shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to Turn Your Ideas Into Reality?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join our community of innovators, creators, and learners. Start your
            journey today.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">Join DassReal</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/explore">Explore Platform</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
