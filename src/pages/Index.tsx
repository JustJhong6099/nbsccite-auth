import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  GraduationCap,
  UserPlus,
  LogIn,
  Brain,
  FileText,
  BarChart3,
  Info,
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
    // Don't redirect if user is trying to access reset password
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      console.log('🔒 Recovery token detected on homepage - redirecting to reset-password page');
      navigate('/reset-password');
      return;
    }
    
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
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src="/NBSCLOGO.png"
              alt="NBSC Logo"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-white leading-tight px-2">
            NORTHERN BUKIDNON STATE COLLEGE
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
            Entity Extraction System
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            A Research analytics platform for Northern Bukidnon State College - Institute for Computer Studies
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-gradient-primary hover:bg-primary-hover shadow-elegant transition-smooth w-full sm:w-auto"
              >
                <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Sign In
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth w-full sm:w-auto"
              >
                <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-3 sm:px-4">
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

      {/* About Us Link - Fixed Bottom Left */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-white/90 hover:text-white font-medium text-sm sm:text-lg underline decoration-white/50 hover:decoration-white underline-offset-4 transition-all duration-300 flex items-center gap-1 sm:gap-2">
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              About Us
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">About Us</DialogTitle>
              <DialogDescription className="text-base text-gray-700 space-y-4 mt-4">
                <p>
                  The <strong>Web-Based Entity Extraction System</strong> is an innovative solution developed by{" "}
                  <strong>Christian Cholo Llenas</strong>, <strong>Catherene T. Labinisia</strong>,{" "}
                  <strong>Roger Dimatao Jr.</strong>, and <strong>Aljhon G. Emata</strong>—Bachelor of Science in 
                  Information Technology students of <strong>Northern Bukidnon State College - Institute for Computer Studies</strong>.
                </p>
                
                <p>
                  This project stands as a testament to dedicated academic collaboration and visionary guidance. We are 
                  profoundly grateful to our <strong>Project Adviser, Ms. Cristine Joy G. Sagaosao</strong>, whose 
                  mentorship and direction have been instrumental in shaping this system from concept to implementation.
                </p>
                
                <p>
                  We must especially acknowledge <strong>Sir Cliff Amadeus F. Evangelio</strong>, whose 
                  instrumental role in developing the foundational concept and idea for this web-based entity extraction 
                  system became the cornerstone of our entire research and development journey. His vision provided the 
                  conceptual framework that guided every phase of our project.
                </p>
                
                <p>
                  We also extend our gratitude to <strong>Ms. SHIELA MAE M. OROZCO, MIT - PROGRAM HEAD</strong>, 
                  whose leadership and support provided the institutional foundation necessary for this capstone project 
                  to thrive. We are equally grateful to our esteemed panelists, <strong>Ms. CHARLENE O. BULAHAN, MSCA</strong> and{" "}
                  <strong>Ms. MARCHILYN A. ABUNDA</strong>, whose valuable insights and constructive feedback 
                  significantly enhanced the quality and depth of our research.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
