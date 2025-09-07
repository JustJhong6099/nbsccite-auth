import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginFormData } from "@/lib/auth-schemas";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";

const Login: React.FC = () => {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate("/admin-dashboard");
      } else if (user.role === 'student') {
        navigate("/student-dashboard");
      } else if (user.role === 'faculty') {
        navigate("/faculty-dashboard");
      } else {
        navigate("/"); // Fallback to homepage
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Simulate page loading time
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast({
        title: "Login Successful!",
        description: "Welcome back to NBSC Entity Extraction System",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  // Show loading spinner while page is loading
  if (pageLoading) {
    return <LoadingSpinner text="Loading Sign In..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      
      {/* Two-pane layout container */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Pane - Academic Achievement Theme */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/NBSCLOGO.png"
              alt="NBSC Logo"
              className="w-60 h-60 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            NORTHERN BUKIDNON<br />
            STATE COLLEGE
          </h1>
          <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-6">
            Empowering Academic Excellence
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Research • Innovation • Discovery
          </p>
          <p className="text-lg text-white/90 max-w-md mx-auto">
            Access advanced research analytics and entity extraction tools designed to enhance academic research and data analysis at NBSC.
          </p>
        </div>

        {/* Right Pane - Login Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 relative">
          <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all hover:scale-105 hover:border-primary/40 hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm font-medium text-gray-700">Signing in...</p>
                </div>
              </div>
            )}
            
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome back!</CardTitle>
              <CardDescription className="text-center">
                Sign in with your NBSC email and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="your.name@nbsc.edu.ph"
                  className={errors.email ? "border-destructive focus:ring-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  {...register("password")}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth shadow-elegant"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link
                  to="/"
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  ← Back to Homepage
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
        
      </div>
    </div>
  );
};

export default Login;