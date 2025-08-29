import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, UserPlus, LogIn, Brain, FileText, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 shadow-glow">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            NBSC Entity Extraction System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advanced research analytics platform for Northern Bukidnon State College - Institute of Computer Studies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover shadow-elegant transition-smooth">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth">
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-card border-0 bg-gradient-card transition-smooth hover:shadow-glow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Entity Extraction</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Automatically extract and analyze research entities, technologies, and keywords from academic abstracts using advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card transition-smooth hover:shadow-glow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Research Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Visualize research trends, popular technologies, and domain distributions with interactive charts and insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card transition-smooth hover:shadow-glow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Abstract Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription>
                Efficiently manage and organize research abstracts with powerful search, filtering, and categorization tools.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-cta shadow-cta">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join the NBSC research community and discover valuable insights from academic research with our AI-powered entity extraction system.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover shadow-elegant">
              Register with NBSC Email
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-2">
            Registration requires a valid NBSC email address (e.g., yourname@nbsc.edu.ph).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
