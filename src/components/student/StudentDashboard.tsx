import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
  LogOut,
  Loader2
} from "lucide-react";

import { AbstractSubmission } from './AbstractSubmission';
import { MyAbstracts } from './MyAbstracts';
import { AbstractsLibrary } from './AbstractsLibrary';
import { EntityVisualization } from './EntityVisualization';
import { ResearchInsights } from './ResearchInsights';
import { ProfileManagement } from './ProfileManagement';

// Interface for abstract data
interface Abstract {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'needs-revision';
  submitted_date: string;
  review_comments?: string;
}

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Real-time data state
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate real stats from fetched data
  const stats = {
    totalAbstracts: abstracts.length,
    acceptedPapers: abstracts.filter(a => a.status === 'approved').length,
    pendingReviews: abstracts.filter(a => a.status === 'pending' || a.status === 'reviewed').length,
  };
  
  // Fetch student's abstracts
  useEffect(() => {
    const fetchAbstracts = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching abstracts for user:', user.id);
        
        const { data, error } = await supabase
          .from('abstracts')
          .select('*')
          .eq('student_id', user.id)
          .order('submitted_date', { ascending: false });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Fetched abstracts:', data);
        setAbstracts(data || []);
      } catch (error) {
        console.error('Error fetching abstracts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAbstracts();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('abstracts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'abstracts',
          filter: `student_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchAbstracts();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
      case 'needs-revision':
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      case 'reviewed':
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
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
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Submit Abstract
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading your data...</span>
              </div>
            ) : (
              <>
                {/* Student Info Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="text-xl">
                          {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || 'Student'}</h2>
                        <p className="text-gray-600">Student</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{user?.email}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalAbstracts}</div>
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
                          <p className="text-3xl font-bold text-blue-600">{stats.totalAbstracts}</p>
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
                          <p className="text-3xl font-bold text-green-600">{stats.acceptedPapers}</p>
                        </div>
                        <Award className="h-12 w-12 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pending Reviews</p>
                          <p className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</p>
                        </div>
                        <Calendar className="h-12 w-12 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <CardDescription>Your latest abstract submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {abstracts.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No submissions yet. Submit your first abstract!</p>
                        <Button onClick={() => setActiveTab('submit')} className="mt-4">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Abstract
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {abstracts.slice(0, 5).map((abstract) => (
                          <div key={abstract.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{abstract.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  Submitted {new Date(abstract.submitted_date).toLocaleDateString()}
                                </p>
                                {getStatusBadge(abstract.status)}
                              </div>
                              {abstract.review_comments && (
                                <div className="mt-2 text-xs text-gray-600 italic bg-blue-50 p-2 rounded border border-blue-200">
                                  <span className="font-medium">Feedback:</span> {abstract.review_comments.substring(0, 100)}
                                  {abstract.review_comments.length > 100 && '...'}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button onClick={() => setActiveTab('submit')} className="h-20 flex flex-col gap-2">
                        <Upload className="h-6 w-6" />
                        Submit New Abstract
                      </Button>
                      <Button onClick={() => setActiveTab('abstracts')} variant="outline" className="h-20 flex flex-col gap-2">
                        <FileText className="h-6 w-6" />
                        View My Abstracts
                      </Button>
                      <Button onClick={() => setActiveTab('visualization')} variant="outline" className="h-20 flex flex-col gap-2">
                        <Brain className="h-6 w-6" />
                        Entity Network
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Submit Abstract Tab */}
          <TabsContent value="submit">
            <AbstractSubmission />
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
