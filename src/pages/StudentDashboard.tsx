import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Eye, 
  Edit, 
  BarChart3, 
  Lightbulb, 
  User,
  TrendingUp,
  GitBranch,
  Calendar,
  Search,
  Brain
} from "lucide-react";

// Import student dashboard components
import { AbstractSubmission } from "@/components/student/AbstractSubmission";
import { EntityVisualization } from "@/components/student/EntityVisualization";
import { ResearchInsights } from "@/components/student/ResearchInsights";
import { ProfileManagement } from "@/components/student/ProfileManagement";
import { MyAbstracts } from "@/components/student/MyAbstracts";

// Mock student data
const mockStudent = {
  id: 'student_1',
  full_name: 'John Smith',
  email: 'john.smith@student.nbsc.edu',
  student_id: '2021-00123',
  program: 'Bachelor of Science in Computer Science',
  year_level: '4th Year',
  phone: '+1-555-0123',
  profile_picture: null,
  abstracts_submitted: 3,
  abstracts_approved: 2,
  abstracts_pending: 1,
  research_interests: ['Machine Learning', 'Web Development', 'Data Science'],
  joined_date: '2021-08-15'
};

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {mockStudent.full_name}!</h1>
                <p className="text-gray-600">{mockStudent.program} • {mockStudent.year_level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Student ID: {mockStudent.student_id}
              </Badge>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Academic Year 2024-2025
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <GitBranch className="h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Abstracts Submitted</p>
                      <p className="text-2xl font-bold text-blue-600">{mockStudent.abstracts_submitted}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{mockStudent.abstracts_approved}</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-600">{mockStudent.abstracts_pending}</p>
                    </div>
                    <Search className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Research Areas</p>
                      <p className="text-2xl font-bold text-purple-600">{mockStudent.research_interests.length}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Your latest abstract submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">ML Applications in Education</div>
                        <div className="text-sm text-gray-600">Submitted 2 days ago</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Web Development Framework</div>
                        <div className="text-sm text-gray-600">Submitted 1 week ago</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Database Optimization Study</div>
                        <div className="text-sm text-gray-600">Submitted 2 weeks ago</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                  <CardDescription>Your current research focus areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStudent.research_interests.map((interest, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800">{interest}</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Interests
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('submit')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Upload className="h-6 w-6" />
                    Submit New Abstract
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('visualization')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <GitBranch className="h-6 w-6" />
                    View Entity Graph
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('insights')}
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <TrendingUp className="h-6 w-6" />
                    Research Trends
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

export default StudentDashboard;
