import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Target
} from "lucide-react";

import { AbstractSubmission } from './AbstractSubmission';
import { MyAbstracts } from './MyAbstracts';
import { EntityVisualization } from './EntityVisualization';
import { ResearchInsights } from './ResearchInsights';
import { ProfileManagement } from './ProfileManagement';

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
    citations: 12,
    hIndex: 2,
    collaborations: 3
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
      type: 'citation',
      title: 'Your paper was cited by "Advanced Educational Technologies"',
      date: '2024-01-08',
      status: 'cited'
    },
    {
      id: 4,
      type: 'collaboration',
      title: 'Invited to collaborate on "Smart Campus Initiative"',
      date: '2024-01-05',
      status: 'invitation'
    }
  ],
  upcomingDeadlines: [
    {
      id: 1,
      title: 'NBSC-ICS 2024 Abstract Submission',
      date: '2024-02-15',
      daysLeft: 12,
      type: 'submission'
    },
    {
      id: 2,
      title: 'Conference Presentation Preparation',
      date: '2024-03-01',
      daysLeft: 26,
      type: 'presentation'
    },
    {
      id: 3,
      title: 'Research Progress Review',
      date: '2024-02-20',
      daysLeft: 17,
      type: 'review'
    }
  ]
};

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'acceptance': return <Award className="h-4 w-4 text-green-600" />;
      case 'citation': return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case 'collaboration': return <Users className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'cited': return 'bg-purple-100 text-purple-800';
      case 'invitation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeadlineUrgency = (daysLeft: number) => {
    if (daysLeft <= 7) return 'bg-red-100 text-red-800 border-red-300';
    if (daysLeft <= 14) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {mockStudentData.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Quick Submit
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockStudentData.avatar || undefined} />
              <AvatarFallback>
                {mockStudentData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Submit Abstract
            </TabsTrigger>
            <TabsTrigger value="abstracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Abstracts
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Entity Visualization
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
                      {mockStudentData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{mockStudentData.name}</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <p className="text-sm text-gray-600">Total Citations</p>
                      <p className="text-3xl font-bold text-purple-600">{mockStudentData.stats.citations}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-purple-500" />
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

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Collaborations</p>
                      <p className="text-3xl font-bold text-indigo-600">{mockStudentData.stats.collaborations}</p>
                    </div>
                    <Users className="h-12 w-12 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Important dates and deadlines to remember</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStudentData.upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                            <p className="text-xs text-gray-500">{deadline.date}</p>
                          </div>
                        </div>
                        <Badge className={getDeadlineUrgency(deadline.daysLeft)}>
                          {deadline.daysLeft} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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
                  <Button onClick={() => setActiveTab('abstracts')} variant="outline" className="h-20 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    View My Papers
                  </Button>
                  <Button onClick={() => setActiveTab('visualization')} variant="outline" className="h-20 flex flex-col gap-2">
                    <Brain className="h-6 w-6" />
                    Explore Entities
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

          {/* My Abstracts Tab */}
          <TabsContent value="abstracts">
            <MyAbstracts />
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
