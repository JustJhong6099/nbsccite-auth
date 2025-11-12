import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Parse the URL hash to get the tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        
        console.log('=== RESET PASSWORD DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Access Token:', accessToken ? 'PRESENT' : 'MISSING');
        console.log('Type:', type);
        console.log('===========================');
        
        if (!accessToken || type !== 'recovery') {
          console.error('❌ Invalid reset link - missing token or wrong type');
          toast({
            title: "Invalid Reset Link",
            description: "This password reset link is invalid or has expired",
            variant: "destructive",
          });
          setIsCheckingToken(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Verify the session but don't redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error: error?.message 
        });
        
        if (error) {
          console.error('❌ Session error:', error);
          toast({
            title: "Session Error",
            description: "Unable to verify reset session. Please request a new reset link.",
            variant: "destructive",
          });
          setIsCheckingToken(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Session is valid - allow password reset
        setIsValidToken(true);
        setIsCheckingToken(false);
        console.log('✅ Reset token validated successfully - STAYING ON RESET PAGE');
      } catch (error) {
        console.error('💥 Error checking session:', error);
        setIsCheckingToken(false);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);

    try {
      console.log('🔄 Attempting to update password...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      console.log('📝 Password update result:', { data, error });

      if (error) throw error;

      console.log('✅ Password updated successfully!');
      
      setResetSuccess(true);
      
      toast({
        title: "Password Reset Successful!",
        description: "Your password has been updated. Redirecting to login...",
        variant: "default",
      });

      // Wait a moment before signing out
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🚪 Signing out user...');
      
      // Sign out the user to force them to login with new password
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
      } else {
        console.log('✅ User signed out successfully');
      }

      // Redirect to login after 2 seconds
      setTimeout(() => {
        console.log('🔀 Redirecting to login page...');
        window.location.href = '/login'; // Force full page reload
      }, 2000);
    } catch (error: any) {
      console.error('💥 Password reset error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Show loading while checking token
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if token is invalid
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
        <div className="w-full max-w-md relative z-10">
          <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">Redirecting to login page...</p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: 'url(/background.jpg)'}}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/50"></div>
      
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {resetSuccess ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {resetSuccess ? "Password Reset Complete!" : "Create New Password"}
            </CardTitle>
            <CardDescription className="text-center">
              {resetSuccess 
                ? "Your password has been successfully reset. You'll need to login with your new password." 
                : "You must set a new password to continue. The password reset session will expire after you set your new password."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-900">
                    Redirecting you to the login page...
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    🔒 <strong>Security Notice:</strong> You must create a new password before you can access your account. Your old password will no longer work.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInput
                    placeholder="Enter new password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <PasswordInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:bg-primary-hover transition-smooth shadow-elegant"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
