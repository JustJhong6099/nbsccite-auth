import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  GraduationCap,
  UserPlus,
  LogIn,
  Brain,
  FileText,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate page loading time
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Redirect authenticated users to their respective dashboards
  useEffect(() => {
    if (isAuthenticated && user && !pageLoading) {
      // v2.0: Admin role removed, faculty now has full privileges
      if (user.role === 'student') {
        navigate("/student-dashboard");
      } else if (user.role === 'faculty') {
        navigate("/faculty-dashboard");
      }
    }
  }, [isAuthenticated, user, pageLoading, navigate]);

  // Show loading spinner while page is loading
  if (pageLoading) {
    return <LoadingSpinner text="Welcome to NBSC..." />;
  }
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/background.jpg)" }}
    >
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/40"></div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img
              src="/NBSCLOGO.png"
              alt="NBSC Logo"
              className="w-40 h-40 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white leading-tight">
            NORTHERN BUKIDNON STATE COLLEGE
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">
            Entity Extraction System
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            A Research analytics platform for Northern Bukidnon State College - Institute for Computer Studies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-gradient-primary hover:bg-primary-hover shadow-elegant transition-smooth"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Entity Extraction */}
          <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-gray-900">Entity Extraction</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600">
                Extract and analyze research entities, technologies, and
                keywords from academic abstracts using advanced text analysis
                tools.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Research Analytics */}
          <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all hover:scale-105 hover:border-accent/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-gray-900">
                Research Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600">
                Explore research trends, technologies, and domain distributions
                with interactive, data-driven charts and visual insights.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Abstract Management */}
          <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-gray-900">
                Abstract Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-gray-600">
                Manage and organize research abstracts with easy-to-use tools
                for searching, filtering, and categorization.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
