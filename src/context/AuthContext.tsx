import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "faculty" | "student"; // v2.0: admin role removed
  status: "active" | "pending" | "rejected";
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

interface SignupData {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "faculty";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Reduce timeout to prevent session interference
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = result as any;

      console.log('📋 Profile fetch result:', { data, error });

      if (error) {
        console.warn('⚠️ Profile fetch warning:', error.message);
        // Return a basic profile structure if database fetch fails
        // This prevents breaking the auth flow
        return {
          id: userId,
          email: 'unknown@email.com',
          full_name: 'User',
          role: 'student' as const,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Profile fetch error (using fallback):', error.message);
      
      // Return fallback profile to prevent auth flow breakage
      return {
        id: userId,
        email: 'unknown@email.com',
        full_name: 'User',
        role: 'student' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  };

  const refreshProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const userProfile = await fetchProfile(authUser.id);
      if (userProfile) {
        setProfile(userProfile);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          status: userProfile.status,
        });
      }
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setIsLoading(true);
      console.log('🔍 Getting initial session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📝 Session data:', session);
        console.log('❌ Session error:', error);
        
        if (session?.user) {
          console.log('👤 User found:', session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          console.log('📋 Profile data:', userProfile);
          
          if (userProfile) {
            setProfile(userProfile);
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              full_name: userProfile.full_name,
              role: userProfile.role,
              status: userProfile.status,
            });
          } else {
            console.log('❌ No profile found, signing out user');
            await supabase.auth.signOut();
          }
        } else {
          console.log('📝 No session found');
        }
      } catch (error) {
        console.error('💥 Initial session error:', error);
      } finally {
        // Always ensure loading is set to false
        console.log('✅ Setting loading to false');
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              full_name: userProfile.full_name,
              role: userProfile.role,
              status: userProfile.status,
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📝 Login result:', { data, error });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('👤 User authenticated, fetching profile...');
        const userProfile = await fetchProfile(data.user.id);
        
        if (!userProfile) {
          console.error('❌ Profile not found for user:', data.user.id);
          throw new Error("Profile not found. Please contact administrator.");
        }

        console.log('📋 User profile:', userProfile);

        if (userProfile.status === 'rejected') {
          console.log('🚫 User account rejected');
          await supabase.auth.signOut();
          throw new Error("Your account has been rejected. Please contact administrator.");
        }

        console.log('✅ Login successful, setting user state');
        setProfile(userProfile);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          status: userProfile.status,
        });
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      console.log('🔍 Starting signup for:', userData.email);
      console.log('📝 Signup data:', { ...userData, password: '[HIDDEN]' });
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });

      console.log('📝 Signup result:', { data, error });
      console.log('📝 User metadata sent:', { full_name: userData.full_name, role: userData.role });

      if (error) {
        console.error('❌ Signup error:', error);
        throw new Error(error.message);
      }

      if (data.user && !data.session) {
        console.log('✅ User created, email confirmation required');
        // Email confirmation required
        return;
      }

      console.log('✅ Signup completed successfully');
    } catch (error) {
      console.error('💥 Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Starting logout process...');
      
      // Clear local state first
      setUser(null);
      setProfile(null);
      
      // Then attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.warn('⚠️ Logout warning (but continuing):', error.message);
        // Don't throw error - still clear local state and redirect
        // This handles cases where session is already invalid
      }
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Don't throw error - still clear local state
      // Force logout even if API call fails
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    profile,
    isAuthenticated: !!user && user.status === 'active',
    login,
    signup,
    logout,
    isLoading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};