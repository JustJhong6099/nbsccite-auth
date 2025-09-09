import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  Camera,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Download,
  Trash2,
  Save,
  Edit,
  Plus,
  X
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
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.academic.researchInterests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        academic: {
          ...prev.academic,
          researchInterests: [...prev.academic.researchInterests, newInterest.trim()]
        }
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        researchInterests: prev.academic.researchInterests.filter(i => i !== interest)
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.academic.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        academic: {
          ...prev.academic,
          skills: [...prev.academic.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        skills: prev.academic.skills.filter(s => s !== skill)
      }
    }));
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

  const updateAcademicField = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      academic: {
        ...prev.academic,
        [field]: value
      }
    }));
  };

  const updatePrivacyField = (field: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
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

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.personal.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.personal.firstName[0]}{profile.personal.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.personal.firstName} {profile.personal.lastName}
              </h1>
              <p className="text-gray-600">{profile.academic.program}</p>
              <p className="text-sm text-gray-500">Student ID: {profile.personal.studentId}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  {profile.personal.email}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  Class of {profile.personal.enrollmentYear}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{profile.research.totalAbstracts}</div>
                  <div className="text-xs text-gray-600">Papers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{profile.research.totalCitations}</div>
                  <div className="text-xs text-gray-600">Citations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{profile.research.hIndex}</div>
                  <div className="text-xs text-gray-600">H-Index</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="research" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Research
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your basic personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.personal.firstName}
                    onChange={(e) => updatePersonalField('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.personal.lastName}
                    onChange={(e) => updatePersonalField('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.personal.email}
                    onChange={(e) => updatePersonalField('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.personal.phone}
                    onChange={(e) => updatePersonalField('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.personal.dateOfBirth}
                    onChange={(e) => updatePersonalField('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={profile.personal.studentId}
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.personal.address}
                  onChange={(e) => updatePersonalField('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={profile.personal.bio}
                  onChange={(e) => updatePersonalField('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself, your research interests, and academic goals..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Manage your academic details, research interests, and skills</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={profile.academic.program}
                    onChange={(e) => updateAcademicField('program', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={profile.academic.major}
                    onChange={(e) => updateAcademicField('major', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minor">Minor</Label>
                  <Input
                    id="minor"
                    value={profile.academic.minor}
                    onChange={(e) => updateAcademicField('minor', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA</Label>
                  <Input
                    id="gpa"
                    value={profile.academic.gpa}
                    onChange={(e) => updateAcademicField('gpa', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                  <Input
                    id="expectedGraduation"
                    type="month"
                    value={profile.academic.expectedGraduation}
                    onChange={(e) => updateAcademicField('expectedGraduation', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advisor">Academic Advisor</Label>
                  <Input
                    id="advisor"
                    value={profile.academic.advisor}
                    onChange={(e) => updateAcademicField('advisor', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Research Interests */}
              <div className="space-y-4">
                <Label>Research Interests</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.academic.researchInterests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add research interest"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    />
                    <Button onClick={handleAddInterest}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label>Technical Skills</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.academic.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <Button onClick={handleAddSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Profile Tab */}
        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Profile</CardTitle>
              <CardDescription>Overview of your research activities and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Research Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Publications:</span>
                      <span className="font-medium">{profile.research.totalAbstracts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Citations:</span>
                      <span className="font-medium">{profile.research.totalCitations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>H-Index:</span>
                      <span className="font-medium">{profile.research.hIndex}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Research Groups</h4>
                  <div className="space-y-2">
                    {profile.research.researchGroups.map((group, index) => (
                      <Badge key={index} variant="secondary">{group}</Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Conferences</h4>
                  <div className="space-y-2">
                    {profile.research.conferences.map((conf, index) => (
                      <Badge key={index} variant="outline">{conf}</Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Awards & Recognition</h4>
                  <div className="space-y-2">
                    {profile.research.awards.map((award, index) => (
                      <Badge key={index} variant="default">{award}</Badge>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CV
                </Button>
                <Button variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  View Public Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information and how you appear in searches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-gray-600">Who can view your profile</p>
                  </div>
                  <Select 
                    value={profile.privacy.profileVisibility} 
                    onValueChange={(value) => setProfile(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: value }
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="institution">Institution Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Email Address</h4>
                    <p className="text-sm text-gray-600">Display email on public profile</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showEmail}
                    onCheckedChange={(checked) => updatePrivacyField('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Phone Number</h4>
                    <p className="text-sm text-gray-600">Display phone on public profile</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showPhone}
                    onCheckedChange={(checked) => updatePrivacyField('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Research Interests</h4>
                    <p className="text-sm text-gray-600">Display research interests publicly</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showResearchInterests}
                    onCheckedChange={(checked) => updatePrivacyField('showResearchInterests', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Show Publications</h4>
                    <p className="text-sm text-gray-600">Display publication list publicly</p>
                  </div>
                  <Switch
                    checked={profile.privacy.showPublications}
                    onCheckedChange={(checked) => updatePrivacyField('showPublications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Allow Collaboration Requests</h4>
                    <p className="text-sm text-gray-600">Let others contact you for research collaboration</p>
                  </div>
                  <Switch
                    checked={profile.privacy.allowCollaboration}
                    onCheckedChange={(checked) => updatePrivacyField('allowCollaboration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Include in Search Results</h4>
                    <p className="text-sm text-gray-600">Appear in researcher directory searches</p>
                  </div>
                  <Switch
                    checked={profile.privacy.indexInSearch}
                    onCheckedChange={(checked) => updatePrivacyField('indexInSearch', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
