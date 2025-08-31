import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "faculty" | "student";
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
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
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
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('� Profile fetch error:', error);
      
      // If there's an error, still set loading to false and return null
      // This prevents infinite loading
      return null;
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

        if (userProfile.status === 'pending' && userProfile.role === 'faculty') {
          console.log('⏳ Faculty account pending approval');
          await supabase.auth.signOut();
          throw new Error("Your faculty account is pending approval. Please wait for administrator approval.");
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

      if (userData.role === 'faculty') {
        console.log('👨‍🏫 Faculty signup, signing out and showing approval message');
        // Faculty accounts need approval
        await supabase.auth.signOut();
        throw new Error("Faculty account created successfully. Please wait for administrator approval before signing in.");
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
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