import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { signupSchema, SignupFormData } from "@/lib/auth-schemas";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Mail, FileText } from "lucide-react";

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    // Simulate page loading time
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: SignupFormData) => {
    if (!termsAccepted) {
      toast({
        title: "Terms and Conditions Required",
        description: "Please accept the Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading spinner while page is loading
  if (pageLoading) {
    return <LoadingSpinner text="Loading Registration..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      
      {/* Two-pane layout container */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Pane - NBSC Logo and Headers */}
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
          <p className="text-xl lg:text-2xl text-white font-semibold mb-2">Empowering Academic Excellence</p>
          <p className="text-lg text-white/90 mb-6">
            Excellence • Innovation • Inclusivity
          </p>
          <p className="text-lg text-white/90 max-w-md mx-auto">
            Join our academic community and access advanced research analytics tools designed for Northern Bukidnon State College.
          </p>
        </div>

        {/* Right Pane - Signup Card */}
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
                  <p className="text-sm font-medium text-gray-700">Creating account...</p>
                </div>
              </div>
            )}
            
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Register with your official NBSC email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  {...register("full_name")}
                  type="text"
                  placeholder="John Doe"
                  className={errors.full_name ? "border-destructive focus:ring-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="your.email@nbsc.edu.ph"
                  className={errors.email ? "border-destructive focus:ring-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  📌 Student emails start with numbers (e.g., 20211199@nbsc.edu.ph)<br />
                  📌 Faculty emails start with letters (e.g., jhongemata@nbsc.edu.ph)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  {...register("password")}
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>At least 6 characters long</li>
                    <li>Contains at least one number</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword?.message}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-tight cursor-pointer"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-primary hover:text-primary-hover font-medium underline underline-offset-2"
                    >
                      Terms and Conditions
                    </button>
                    {" "}and understand how my personal information will be collected and used.
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth shadow-elegant"
                disabled={isLoading || !termsAccepted}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Sign in here
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

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="text-xl">Registration Successful!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Your account has been created successfully.</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span className="font-medium">{registeredEmail}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Please check your email to verify your account before signing in.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Link to="/login">
              <Button className="bg-gradient-primary">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl">Terms and Conditions</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Northern Bukidnon State College Research Analytics Platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <section>
              <p className="text-gray-700 leading-relaxed mb-3">
                By creating an account and using the Northern Bukidnon State College (NBSC) Research Analytics Platform, you agree to these Terms and Conditions.
              </p>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-3">
                <p className="font-semibold text-gray-800 mb-2">Data Collection and Usage:</p>
                <p className="text-gray-700 mb-2">The platform collects and processes the following personal information:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Full Name</strong></li>
                  <li><strong>Email Address</strong></li>
                  <li><strong>Contact Details</strong></li>
                  <li><strong>Role Information</strong></li>
                  <li><strong>Research Data</strong> (abstracts, themes, and contributions)</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  <strong>Purpose:</strong> Account management, research collaboration, institutional analytics, and communication purposes.
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                All data is stored securely with industry-standard encryption, accessible only to authorized personnel, and retained as long as your account is active or as required by institutional and legal obligations. 
                You agree to provide accurate information, use your official NBSC email, maintain account confidentiality, and use the platform for legitimate academic purposes while respecting intellectual property rights. 
                This platform complies with the Data Privacy Act of 2012 (RA 10173), protecting your rights to access, correct, and delete personal data, and NBSC reserves the right to update these terms with user notification.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-gray-800 italic">
                <strong>Last Updated:</strong> November 12, 2025<br />
                <strong>Effective Date:</strong> November 12, 2025<br />
                <strong>Platform:</strong> NBSC Research Analytics & Citation Tracking System
              </p>
            </section>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowTermsModal(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setShowTermsModal(false);
              }}
              className="bg-gradient-primary"
            >
              Accept Terms
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;