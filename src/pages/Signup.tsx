import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { signupSchema, SignupFormData } from "@/lib/auth-schemas";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, CheckCircle, Mail, Users, BookOpen, FileText } from "lucide-react";

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredRole, setRegisteredRole] = useState<"student" | "faculty">("student");
  const [pageLoading, setPageLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const selectedRole = watch("role");

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
        role: data.role,
      });
      setRegisteredEmail(data.email);
      setRegisteredRole(data.role);
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
                  placeholder="student.number@nbsc.edu.ph"
                  className={errors.email ? "border-destructive focus:ring-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value: "student" | "faculty") => setValue("role", value)}>
                  <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Student</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Faculty</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
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
              <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
              <p className="text-gray-700">
                By creating an account and using the Northern Bukidnon State College (NBSC) Research Analytics Platform, 
                you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and 
                our Data Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">2. Data Collection and Usage</h3>
              <p className="text-gray-700 mb-2">
                The NBSC Research Analytics Platform collects and processes the following personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Full Name:</strong> Used for identification and communication purposes</li>
                <li><strong>Email Address:</strong> Used for account verification, notifications, and official communications</li>
                <li><strong>Contact Information:</strong> Used to facilitate collaboration and research coordination</li>
                <li><strong>Role Information:</strong> To determine access levels (Student or Faculty)</li>
                <li><strong>Research Data:</strong> Including submitted abstracts, research themes, and academic contributions</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. Purpose of Data Collection</h3>
              <p className="text-gray-700 mb-2">Your personal information is collected for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>To create and manage your user account</li>
                <li>To provide access to research analytics tools and resources</li>
                <li>To facilitate academic research collaboration within NBSC</li>
                <li>To generate institutional research insights and analytics</li>
                <li>To communicate important updates regarding the platform and your submissions</li>
                <li>To maintain system security and prevent unauthorized access</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. Data Protection and Security</h3>
              <p className="text-gray-700">
                We are committed to protecting your personal information. All data is stored securely using industry-standard 
                encryption and security measures. Access to personal information is restricted to authorized personnel only and 
                is used strictly for the purposes outlined in these terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">5. User Responsibilities</h3>
              <p className="text-gray-700 mb-2">As a user of this platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Provide accurate and truthful information during registration</li>
                <li>Use your official NBSC email address for account creation</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform solely for legitimate academic and research purposes</li>
                <li>Respect intellectual property rights and academic integrity standards</li>
                <li>Comply with all applicable NBSC policies and guidelines</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">6. Data Retention and Deletion</h3>
              <p className="text-gray-700">
                Your personal data will be retained for as long as your account remains active or as necessary to provide 
                platform services. You may request account deactivation or data deletion by contacting the system administrator. 
                However, certain data may be retained for legitimate institutional purposes, legal compliance, or archival requirements.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">7. Research Data and Publications</h3>
              <p className="text-gray-700">
                Research abstracts and materials submitted through this platform may be used for institutional analytics, 
                reporting, and publication purposes. Proper attribution will be maintained, and academic authorship rights 
                will be respected in accordance with NBSC research policies.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Compliance with Data Privacy Act</h3>
              <p className="text-gray-700">
                This platform complies with Republic Act No. 10173, also known as the Data Privacy Act of 2012, and its 
                implementing rules and regulations. Your rights as a data subject, including rights to access, correction, 
                and deletion of personal data, are hereby recognized and protected.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">9. Updates to Terms and Conditions</h3>
              <p className="text-gray-700">
                NBSC reserves the right to modify these Terms and Conditions at any time. Users will be notified of 
                significant changes via email. Continued use of the platform after modifications constitutes acceptance 
                of the updated terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Contact Information</h3>
              <p className="text-gray-700">
                For questions, concerns, or requests regarding these Terms and Conditions or your personal data, 
                please contact the NBSC Research Analytics Platform administrator through your official NBSC email.
              </p>
            </section>

            <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-800 italic">
                <strong>Last Updated:</strong> November 11, 2025<br />
                <strong>Effective Date:</strong> November 11, 2025<br />
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