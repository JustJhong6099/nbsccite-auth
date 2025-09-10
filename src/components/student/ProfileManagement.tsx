import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Camera,
  Save,
  Edit
} from "lucide-react";

// Mock user profile data
const mockUserProfile = {
  personal: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@student.nbsc.edu',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1999-03-15',
    address: '123 Campus Drive, University City',
    bio: 'Passionate computer science student with interests in AI, web development, and educational technology. Currently pursuing research in machine learning applications for educational systems.',
    avatar: null,
    studentId: 'CS2021001',
    enrollmentYear: '2021'
  },
  academic: {
    program: 'Bachelor of Science in Computer Science',
    major: 'Computer Science',
    minor: 'Mathematics',
    gpa: '3.85',
    expectedGraduation: '2025-05',
    advisor: 'Dr. Sarah Johnson',
    researchInterests: [
      'Machine Learning',
      'Educational Technology',
      'Web Development',
      'Data Science',
      'Mobile Development'
    ],
    skills: [
      'Python',
      'JavaScript',
      'React',
      'TensorFlow',
      'Node.js',
      'PostgreSQL',
      'Flutter',
      'Git'
    ]
  },
  research: {
    totalAbstracts: 4,
    totalCitations: 12,
    hIndex: 2,
    publicationsCount: 4,
    researchGroups: ['AI Research Lab', 'Educational Technology Group'],
    conferences: ['NBSC-ICS 2023', 'NBSC-ICS 2024'],
    awards: ['Best Student Paper 2023', 'Research Excellence Award 2024']
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showResearchInterests: true,
    showPublications: true,
    allowCollaboration: true,
    indexInSearch: true
  }
};

export const ProfileManagement: React.FC = () => {
  const [profile, setProfile] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const updatePersonalField = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

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
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
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

                <div>
                  <Label className="text-sm font-medium text-gray-700">Address</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <Input
                        value={profile.personal.address}
                        onChange={(e) => updatePersonalField('address', e.target.value)}
                        placeholder="Enter address"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    profile.personal.address && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profile.personal.address}</span>
                      </div>
                    )
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Class</Label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <Input
                        value={profile.personal.enrollmentYear}
                        onChange={(e) => updatePersonalField('enrollmentYear', e.target.value)}
                        placeholder="Enter enrollment year"
                        className="flex-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm mt-1">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Class of {profile.personal.enrollmentYear}</span>
                    </div>
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
