import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Camera,
  Save,
  Edit,
  RefreshCw
} from "lucide-react";

interface ProfileData {
  personal: {
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address: string;
    bio: string;
    avatar: string | null;
    studentId: string;
    enrollmentYear?: string;
  };
  academic: {
    program: string;
    major?: string;
    minor?: string;
    gpa?: string;
    expectedGraduation?: string;
    advisor?: string;
    researchInterests: string[];
    skills: string[];
  };
  research: {
    totalAbstracts: number;
    totalCitations?: number;
    hIndex?: number;
    publicationsCount: number;
    researchGroups?: string[];
    conferences?: string[];
    awards?: string[];
  };
  privacy?: {
    profileVisibility?: string;
    showEmail?: boolean;
    showPhone?: boolean;
    showResearchInterests?: boolean;
    showPublications?: boolean;
    allowCollaboration?: boolean;
    indexInSearch?: boolean;
  };
}

export const ProfileManagement: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch abstracts count
      const { data: abstractsData, error: abstractsError } = await supabase
        .from('abstracts')
        .select('id, status')
        .eq('student_id', user?.id);

      if (abstractsError) throw abstractsError;

      // Transform data to match interface
      const transformedProfile: ProfileData = {
        personal: {
          firstName: profileData.full_name?.split(' ')[0] || '',
          lastName: profileData.full_name?.split(' ').slice(1).join(' ') || '',
          fullName: profileData.full_name || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || '',
          dateOfBirth: profileData.date_of_birth || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          avatar: profileData.avatar_url || null,
          studentId: profileData.student_id || '',
          enrollmentYear: profileData.enrollment_year || ''
        },
        academic: {
          program: profileData.program || 'Bachelor of Science in Information Technology',
          major: profileData.major || '',
          minor: profileData.minor || '',
          gpa: profileData.gpa?.toString() || '',
          expectedGraduation: profileData.expected_graduation || '',
          advisor: profileData.advisor || '',
          researchInterests: profileData.research_interests || [],
          skills: profileData.skills || []
        },
        research: {
          totalAbstracts: abstractsData?.length || 0,
          publicationsCount: abstractsData?.filter(a => a.status === 'approved').length || 0,
          totalCitations: profileData.total_citations || 0,
          hIndex: profileData.h_index || 0,
          researchGroups: profileData.research_groups || [],
          conferences: profileData.conferences || [],
          awards: profileData.awards || []
        },
        privacy: {
          profileVisibility: profileData.profile_visibility || 'public',
          showEmail: profileData.show_email ?? false,
          showPhone: profileData.show_phone ?? false,
          showResearchInterests: profileData.show_research_interests ?? true,
          showPublications: profileData.show_publications ?? true,
          allowCollaboration: profileData.allow_collaboration ?? true,
          indexInSearch: profileData.index_in_search ?? true
        }
      };

      setProfile(transformedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      const errorMessage = error?.message || 'Failed to load profile data';
      toast.error(errorMessage);
      
      // Check if it's a column not found error
      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        toast.error('Database schema needs to be updated. Please run profile-fields-update.sql', {
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: `${profile.personal.firstName} ${profile.personal.lastName}`,
          phone: profile.personal.phone || null,
          date_of_birth: profile.personal.dateOfBirth || null,
          address: profile.personal.address || null,
          bio: profile.personal.bio || null,
          student_id: profile.personal.studentId || null,
          enrollment_year: profile.personal.enrollmentYear || null,
          program: profile.academic.program || null,
          major: profile.academic.major || null,
          minor: profile.academic.minor || null,
          gpa: profile.academic.gpa ? parseFloat(profile.academic.gpa) : null,
          expected_graduation: profile.academic.expectedGraduation || null,
          advisor: profile.academic.advisor || null,
          research_interests: profile.academic.researchInterests,
          skills: profile.academic.skills,
          research_groups: profile.research.researchGroups,
          conferences: profile.research.conferences,
          awards: profile.research.awards,
          profile_visibility: profile.privacy?.profileVisibility || 'public',
          show_email: profile.privacy?.showEmail ?? false,
          show_phone: profile.privacy?.showPhone ?? false,
          show_research_interests: profile.privacy?.showResearchInterests ?? true,
          show_publications: profile.privacy?.showPublications ?? true,
          allow_collaboration: profile.privacy?.allowCollaboration ?? true,
          index_in_search: profile.privacy?.indexInSearch ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Show specific error message
      const errorMessage = error?.message || 'Failed to update profile';
      toast.error(errorMessage);
      
      // Check if it's a column not found error
      if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
        toast.error('Database schema needs to be updated. Please run profile-fields-update.sql', {
          duration: 5000
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalField = (field: string, value: string) => {
    if (!profile) return;
    setProfile(prev => ({
      ...prev!,
      personal: {
        ...prev!.personal,
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-500 mb-4">Unable to load profile data.</p>
        <Button onClick={fetchProfile}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
          <p className="text-gray-600">Manage your personal information and research profile</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" onClick={fetchProfile}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {profile.personal.firstName[0]}{profile.personal.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.personal.firstName} {profile.personal.lastName}
                </h3>
                <p className="text-gray-600">{profile.academic.program}</p>
                <Badge variant="secondary" className="mt-2">
                  Student ID: {profile.personal.studentId}
                </Badge>
              </div>

              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                className="w-full mt-4"
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        value={profile.personal.email}
                        onChange={(e) => updatePersonalField('email', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{profile.personal.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <Input
                        value={profile.personal.phone}
                        onChange={(e) => updatePersonalField('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    profile.personal.phone && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profile.personal.phone}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profile.personal.bio}
                  onChange={(e) => updatePersonalField('bio', e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself, your research interests, and academic goals..."
                />
              ) : (
                <p className="text-gray-700">
                  {profile.personal.bio || "No biography available. Click 'Edit Profile' to add your academic background and interests."}
                </p>
              )}
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
