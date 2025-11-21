import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Beaker, Lightbulb, Users, GraduationCap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  const features = [
    {
      icon: Palette,
      title: "NFT Studio",
      description: "Create unique NFTs with AI-powered image generation and monetization strategies",
      link: "/nft-studio",
      color: "text-purple-500",
    },
    {
      icon: Beaker,
      title: "Material Science",
      description: "Explore and contribute to our collaborative material science knowledge base",
      link: "/material-science",
      color: "text-blue-500",
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description: "Share ideas, vote on innovations, and support projects through crowdfunding",
      link: "/innovation-hub",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      title: "Community Groups",
      description: "Join local groups, collaborate with innovators, and build together",
      link: "/community-groups",
      color: "text-green-500",
    },
    {
      icon: GraduationCap,
      title: "Workshops",
      description: "Discover and participate in hands-on learning experiences",
      link: "/workshops",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Where Innovation Meets Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A collaborative platform empowering late bloomers and innovators to transform ideas into reality through creativity, science, and local collaboration
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/innovation-hub">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Ideas
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index}>
              <Card className="h-full hover:border-primary transition-all hover:shadow-lg cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-3">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">For Creators</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Generate NFTs with AI, share your innovations, and monetize your creativity
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">For Scientists</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Contribute to material science knowledge and collaborate on research projects
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-center">For Communities</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Build local groups, organize workshops, and learn together
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="py-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Ideas?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Join our community of innovators, creators, and scientists making a real impact
              </p>
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8">
                  Join DassReal Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/nft-studio" className="block hover:text-foreground">NFT Studio</Link>
                <Link to="/material-science" className="block hover:text-foreground">Material Science</Link>
                <Link to="/innovation-hub" className="block hover:text-foreground">Innovation Hub</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/community-groups" className="block hover:text-foreground">Groups</Link>
                <Link to="/workshops" className="block hover:text-foreground">Workshops</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/chat" className="block hover:text-foreground">AI Assistant</Link>
                <Link to="/billing" className="block hover:text-foreground">Pricing</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <p className="text-sm text-muted-foreground">
                Empowering late bloomers and innovators worldwide
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 DassReal Community. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
