import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  FileText, 
  Brain, 
  TrendingUp, 
  Search, 
  Filter,
  Download,
  Eye,
  LogOut,
  GraduationCap,
  BarChart3,
  PieChart,
  Tag,
  Check,
  X,
  Clock,
  UserCheck,
  AlertCircle,
  Activity,
  Scan
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase, PendingApproval } from "@/lib/supabase";
import { toast } from "sonner";

// Import new analytics components
import { UserRetentionChart } from "@/components/analytics/UserRetentionChart";
import { UserDistributionChart } from "@/components/analytics/UserDistributionChart";
import { AdminStatsCards } from "@/components/analytics/AdminStatsCards";
import { SubmissionsChart } from "@/components/analytics/SubmissionsChart";
import { EntityAnalyticsChart } from "@/components/analytics/EntityAnalyticsChart";
import { ResearchDomainChart } from "@/components/analytics/ResearchDomainChart";
import { UserManagement } from "@/components/analytics/UserManagement";
import { AbstractManagement } from "@/components/analytics/AbstractManagement";
import { SystemMonitoring } from "@/components/analytics/SystemMonitoring";
import { OCRExtractor } from "@/components/ocr/OCRExtractor";

const AdminDashboard: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigate('/login');
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending approvals:', error);
        return;
      }

      setPendingApprovals(data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc(
        approve ? 'approve_faculty_request' : 'reject_faculty_request',
        { request_id: requestId }
      );

      if (error) {
        throw new Error(error.message);
      }

      toast.success(approve ? "Faculty Request Approved" : "Faculty Request Rejected", {
        description: approve 
          ? "The faculty member can now sign in with their account."
          : "The request has been rejected.",
      });

      // Refresh the pending approvals list
      await fetchPendingApprovals();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for the dashboard
  const stats = {
    totalAbstracts: 245,
    totalUsers: 89,
    pendingFaculty: pendingApprovals.length,
    mostFrequentDomain: "Artificial Intelligence",
    mostFrequentTechnology: "Python",
  };

  const recentAbstracts = [
    {
      id: 1,
      title: "Machine Learning Approaches for Natural Language Processing",
      author: "John Smith",
      submissionDate: "2024-01-15",
      status: "Complete",
      keywords: ["Machine Learning", "NLP", "Python", "TensorFlow"],
    },
    {
      id: 2,
      title: "Web Development Using React and Node.js",
      author: "Maria Garcia",
      submissionDate: "2024-01-14",
      status: "Processing",
      keywords: ["React", "Node.js", "JavaScript", "Web Development"],
    },
    {
      id: 3,
      title: "Database Optimization Techniques in PostgreSQL",
      author: "Ahmed Hassan",
      submissionDate: "2024-01-13",
      status: "Complete",
      keywords: ["Database", "PostgreSQL", "Optimization", "SQL"],
    },
  ];

  const topTechnologies = [
    { name: "Python", count: 45, percentage: 35 },
    { name: "JavaScript", count: 32, percentage: 25 },
    { name: "React", count: 28, percentage: 22 },
    { name: "TensorFlow", count: 15, percentage: 12 },
    { name: "Node.js", count: 8, percentage: 6 },
  ];

  const researchDomains = [
    { name: "Artificial Intelligence", count: 65, percentage: 40 },
    { name: "Web Development", count: 48, percentage: 30 },
    { name: "Database Systems", count: 32, percentage: 20 },
    { name: "Mobile Development", count: 16, percentage: 10 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NBSC Entity Extraction System</h1>
                <p className="text-sm text-muted-foreground">Administrator Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {pendingApprovals.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? 's' : ''}
                </Badge>
              )}
              <div className="text-right">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Pending Approvals Alert */}
        {pendingApprovals.length > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have {pendingApprovals.length} faculty approval request{pendingApprovals.length > 1 ? 's' : ''} pending review.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <AdminStatsCards />

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6 mt-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-[800px]">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="abstracts">Abstracts</TabsTrigger>
            <TabsTrigger value="ocr">OCR & Entities</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserRetentionChart />
              <UserDistributionChart />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <SubmissionsChart />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <EntityAnalyticsChart />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ResearchDomainChart />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Top Technologies
                  </CardTitle>
                  <CardDescription>Most frequently extracted technologies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTechnologies.map((tech, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="font-medium">{tech.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${tech.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{tech.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Research Domains
                  </CardTitle>
                  <CardDescription>Distribution by research area</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {researchDomains.map((domain, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="font-medium">{domain.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent transition-all duration-300"
                              style={{ width: `${domain.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{domain.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ocr" className="space-y-6">
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  OCR & Entity Extraction
                </CardTitle>
                <CardDescription>
                  Extract text from images and identify research entities using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OCRExtractor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Faculty Approval Requests ({pendingApprovals.length})
                </CardTitle>
                <CardDescription>Review and approve faculty account requests</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">
                      All faculty approval requests have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((approval) => (
                      <div key={approval.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{approval.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{approval.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(approval.created_at).toLocaleDateString()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Role: {approval.requested_role}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproval(approval.id, false)}
                              disabled={isLoading}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproval(approval.id, true)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abstracts" className="space-y-6">
            <AbstractManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemMonitoring />
            
            {/* Configuration Settings */}
            <Card className="shadow-card border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system parameters and API settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Dandelion API Configuration</h4>
                      <p className="text-sm text-muted-foreground">Manage entity extraction API settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Tesseract.js Configuration</h4>
                      <p className="text-sm text-muted-foreground">Configure OCR text extraction settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Configure admin notification settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Database Backup</h4>
                      <p className="text-sm text-muted-foreground">Schedule and manage database backups</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">Download extracted entities and analytics</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;