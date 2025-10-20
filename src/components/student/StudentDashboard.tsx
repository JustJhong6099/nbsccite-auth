import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  User,
  BookOpen,
  Upload,
  BarChart3,
  Brain,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  Users,
  Lightbulb,
  Target,
  LogOut
} from "lucide-react";

import { AbstractSubmission } from './AbstractSubmission';
import { MyAbstracts } from './MyAbstracts';
import { AbstractsLibrary } from './AbstractsLibrary';
import { EntityVisualization } from './EntityVisualization';
import { ResearchInsights } from './ResearchInsights';
import { ProfileManagement } from './ProfileManagement';
import { AbstractUploadAndVisualization } from './AbstractUploadAndVisualization';

// Mock student data
const mockStudentData = {
  name: 'John Smith',
  email: 'john.smith@student.nbsc.edu',
  studentId: 'CS2021001',
  program: 'Bachelor of Science in Computer Science',
  year: '4th Year',
  advisor: 'Dr. Sarah Johnson',
  gpa: '3.85',
  avatar: null,
  stats: {
    totalAbstracts: 4,
    acceptedPapers: 3,
    pendingReviews: 1,
    hIndex: 2
  },
  recentActivity: [
    {
      id: 1,
      type: 'submission',
      title: 'Submitted "AI-Powered Learning Analytics Platform"',
      date: '2024-01-15',
      status: 'under_review'
    },
    {
      id: 2,
      type: 'acceptance',
      title: 'Paper "Machine Learning in Educational Assessment" accepted',
      date: '2024-01-10',
      status: 'accepted'
    },
    {
      id: 3,
      type: 'other',
      title: 'Research Progress Review scheduled',
      date: '2024-01-08',
      status: 'scheduled'
    },
    {
      id: 4,
      type: 'other',
      title: 'Updated research profile',
      date: '2024-01-05',
      status: 'completed'
    }
  ]
};

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🔄 Dashboard: Starting logout...');
      await logout();
      console.log('✅ Dashboard: Logout successful, redirecting...');
      navigate('/login', { replace: true });
    } catch (error) {
      console.warn('⚠️ Dashboard: Logout had issues but continuing:', error);
      // Force redirect even if logout had issues
      // Clear any cached data and redirect
      window.localStorage.clear();
      navigate('/login', { replace: true });
      // Force a page reload to clear any remaining state
      window.location.reload();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'acceptance': return <Award className="h-4 w-4 text-green-600" />;
      case 'other': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name || 'Student'}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Quick Submit
            </Button>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockStudentData.avatar || undefined} />
              <AvatarFallback>
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Submit Abstract
            </TabsTrigger>
            <TabsTrigger value="upload-analyze" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload & Analyze
            </TabsTrigger>
            <TabsTrigger value="abstracts" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              My Abstracts
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Entity Network
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Research Insights
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Student Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={mockStudentData.avatar || undefined} />
                    <AvatarFallback className="text-xl">
                      {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || 'Student'}</h2>
                    <p className="text-gray-600">{mockStudentData.program}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>ID: {mockStudentData.studentId}</span>
                      <span>•</span>
                      <span>{mockStudentData.year}</span>
                      <span>•</span>
                      <span>GPA: {mockStudentData.gpa}</span>
                      <span>•</span>
                      <span>Advisor: {mockStudentData.advisor}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{mockStudentData.stats.totalAbstracts}</div>
                    <div className="text-sm text-gray-600">Total Papers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Submitted Abstracts</p>
                      <p className="text-3xl font-bold text-blue-600">{mockStudentData.stats.totalAbstracts}</p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Accepted Papers</p>
                      <p className="text-3xl font-bold text-green-600">{mockStudentData.stats.acceptedPapers}</p>
                    </div>
                    <Award className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">H-Index</p>
                      <p className="text-3xl font-bold text-orange-600">{mockStudentData.stats.hIndex}</p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                      <p className="text-3xl font-bold text-yellow-600">{mockStudentData.stats.pendingReviews}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest research activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudentData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          <Badge className={`text-xs ${getActivityBadgeColor(activity.status)}`}>
                            {activity.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button onClick={() => setActiveTab('submit')} className="h-20 flex flex-col gap-2">
                    <Upload className="h-6 w-6" />
                    Submit New Abstract
                  </Button>
                  <Button onClick={() => setActiveTab('upload-analyze')} variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Upload & Analyze
                  </Button>
                  <Button onClick={() => setActiveTab('visualization')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Brain className="h-6 w-6" />
                    Entity Network
                  </Button>
                  <Button onClick={() => setActiveTab('insights')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Lightbulb className="h-6 w-6" />
                    Research Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit Abstract Tab */}
          <TabsContent value="submit">
            <AbstractSubmission />
          </TabsContent>

          {/* Upload & Analyze Tab */}
          <TabsContent value="upload-analyze">
            <AbstractUploadAndVisualization />
          </TabsContent>

          {/* My Abstracts Tab */}
          <TabsContent value="abstracts">
            <MyAbstracts />
          </TabsContent>

          {/* Abstracts Library Tab */}
          <TabsContent value="library">
            <AbstractsLibrary />
          </TabsContent>

          {/* Entity Visualization Tab */}
          <TabsContent value="visualization">
            <EntityVisualization />
          </TabsContent>

          {/* Research Insights Tab */}
          <TabsContent value="insights">
            <ResearchInsights />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
