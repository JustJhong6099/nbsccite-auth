import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/context/AuthContext";
import { signupSchema, SignupFormData } from "@/lib/auth-schemas";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, CheckCircle, Mail } from "lucide-react";

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setShowSuccessModal(true);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
      {/* Subtle overlay to ensure readability while preserving the NBSC imagery */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      <div className="w-full max-w-md relative z-10">
        {/* NBSC Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-glow">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">NBSC-ICS</h1>
          <p className="text-muted-foreground">Entity Extraction System</p>
        </div>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Register with your official NBSC email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    {...register("firstName")}
                    type="text"
                    placeholder="John"
                    className={errors.firstName ? "border-destructive focus:ring-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    {...register("lastName")}
                    type="text"
                    placeholder="Doe"
                    className={errors.lastName ? "border-destructive focus:ring-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                  placeholder="Create a strong password"
                  error={errors.password?.message}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>At least 8 characters long</li>
                    <li>Contains at least one number</li>
                    <li>Contains at least one special character</li>
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

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth shadow-elegant"
                disabled={isLoading}
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

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default Signup;