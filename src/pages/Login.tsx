import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginFormData } from "@/lib/auth-schemas";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Login: React.FC = () => {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Don't redirect if user is trying to access reset password
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      console.log('🔒 Recovery token detected - redirecting to reset-password page');
      navigate('/reset-password');
      return;
    }
    
    if (isAuthenticated && user) {
      // v2.0: Redirect based on user role (admin role removed)
      if (user.role === 'student') {
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);
      
      // Log for development - check Supabase dashboard logs for actual reset link
      console.log('Password reset requested for:', resetEmail);
      console.log('Redirect URL:', `${window.location.origin}/reset-password`);
      console.log('⚠️ IMPORTANT: Make sure this URL is added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs');
      
      toast({
        title: "Password Reset Email Sent!",
        description: "Please check your email for the password reset link. (Development: Check Supabase logs if email doesn't arrive)",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setResetEmail("");
    setResetSent(false);
  };

  // Show loading spinner while page is loading
  if (pageLoading) {
    return <LoadingSpinner text="Loading Sign In..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-3 sm:p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      
      {/* Two-pane layout container */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        
        {/* Left Pane - Academic Achievement Theme */}
        <div className="text-center hidden lg:block">
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
            Excellence • Innovation • Inclusivity
          </p>
          <p className="text-lg text-white/90 max-w-md mx-auto">
            Access advanced research analytics and entity extraction tools designed to enhance academic research and data analysis at NBSC.
          </p>
        </div>

        {/* Right Pane - Login Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0 relative">
          {/* Mobile Logo - only show on small screens */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/NBSCLOGO.png"
                alt="NBSC Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              NORTHERN BUKIDNON STATE COLLEGE
            </h1>
          </div>
          
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
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

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPasswordModal} onOpenChange={handleCloseForgotPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              {resetSent ? (
                "Check your email for the password reset link"
              ) : (
                "Enter your email address and we'll send you a link to reset your password"
              )}
            </DialogDescription>
          </DialogHeader>
          
          {resetSent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Email sent successfully!</p>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent a password reset link to <strong>{resetEmail}</strong>
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Please check your inbox and spam folder. The link will expire in 1 hour.
                  </p>
                  <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                    <strong>Development Mode:</strong> If you don't receive an email, check your Supabase Dashboard → Authentication → Logs for the reset link, or configure SMTP settings.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCloseForgotPasswordModal}
                className="w-full"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your.name@nbsc.edu.ph"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleForgotPassword();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseForgotPasswordModal}
                  className="flex-1"
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForgotPassword}
                  className="flex-1"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;