import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import * as d3 from "d3";
import { FacultyVisualization } from "./FacultyVisualization";

// Import analytics components (v2.0: Faculty now has admin privileges)
import { UserRetentionChart } from "@/components/analytics/UserRetentionChart";
import { UserDistributionChart } from "@/components/analytics/UserDistributionChart";
import { AdminStatsCards } from "@/components/analytics/AdminStatsCards";
import { SubmissionsChart } from "@/components/analytics/SubmissionsChart";
import { EntityAnalyticsChart } from "@/components/analytics/EntityAnalyticsChart";
import { ResearchDomainChart } from "@/components/analytics/ResearchDomainChart";
import { UserManagement } from "@/components/analytics/UserManagement";
import { AbstractManagement as AdminAbstractManagement } from "@/components/analytics/AbstractManagement";
import { SystemMonitoring } from "@/components/analytics/SystemMonitoring";
import { OCRExtractor } from "@/components/ocr/OCRExtractor";
import { SimpleEntityGraph } from "@/components/student/SimpleEntityGraph";
import { AbstractsLibrary } from "@/components/student/AbstractsLibrary";
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  FileBarChart,
  Upload,
  Eye,
  Edit,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Tag,
  User,
  Save,
  Send,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Check,
  RefreshCw,
  Network,
  Settings,
  Maximize,
  Share,
  Target,
  Database,
  Brain,
  Zap,
  LogOut,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Scan,
  Activity,
  PieChart
} from "lucide-react";

// Interfaces for data types
interface StudentSubmission {
  id: string;
  title: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  submittedDate: string;
  status: "pending" | "reviewed" | "approved" | "rejected" | "needs-revision";
  abstract: string;
  keywords: string[];
  department: string;
  advisorNotes?: string;
  feedback?: string;
  rating?: number;
  lastReviewDate?: string;
}

interface Entity {
  id: string;
  value: string;
  type: "keyword" | "research-field" | "technology" | "methodology" | "location" | "person";
  confidence: number;
  status: "pending" | "validated" | "rejected" | "modified";
  source: string;
  sourceTitle: string;
  extractedBy: "ocr" | "nlp" | "manual";
  validatedBy?: string;
  validatedAt?: string;
  category?: string;
  alternatives?: string[];
  notes?: string;
}

interface Node {
  id: string;
  name: string;
  type: "keyword" | "technology" | "research-field" | "methodology";
  category: string;
  frequency: number;
  abstracts: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  weight: number;
  abstracts: string[];
}

interface Report {
  id: string;
  title: string;
  type: "progress" | "analytics" | "summary" | "departmental" | "trend" | "comparative" | "custom";
  department: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: "completed" | "generating" | "generated" | "scheduled" | "failed";
  generatedBy: string;
  generatedAt: string;
  metrics?: {
    totalAbstracts: number;
    approvedAbstracts: number;
    pendingReviews: number;
    averageScore: number;
    topKeywords: string[];
    researchAreas: string[];
  };
}

// Student Abstract Review Component
const StudentAbstractReview: React.FC = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([
    {
      id: "1",
      title: "Deep Learning Applications in Medical Image Analysis",
      studentName: "John Doe",
      studentEmail: "john.doe@nbsc.edu.ph",
      studentId: "2024-CS-001",
      submittedDate: "2024-09-05",
      status: "pending",
      abstract: "This research investigates the application of deep learning techniques for medical image analysis...",
      keywords: ["Deep Learning", "Medical Imaging", "Computer Vision", "Healthcare"],
      department: "Computer Science",
    },
    {
      id: "2",
      title: "Sustainable Agriculture Using IoT Technology",
      studentName: "Jane Smith",
      studentEmail: "jane.smith@nbsc.edu.ph",
      studentId: "2024-AG-005",
      submittedDate: "2024-09-03",
      status: "reviewed",
      abstract: "This study explores the implementation of IoT sensors and devices...",
      keywords: ["IoT", "Agriculture", "Sustainability", "Smart Farming"],
      department: "Agriculture",
      feedback: "Good research direction. Please expand on the methodology section.",
      rating: 4,
      lastReviewDate: "2024-09-04",
    }
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "",
    feedback: "",
    rating: 0,
    advisorNotes: ""
  });

  const openReviewDialog = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      status: submission.status,
      feedback: submission.feedback || "",
      rating: submission.rating || 0,
      advisorNotes: submission.advisorNotes || ""
    });
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedSubmission) return;

    const updatedSubmissions = submissions.map(submission =>
      submission.id === selectedSubmission.id
        ? {
            ...submission,
            status: reviewForm.status as any,
            feedback: reviewForm.feedback,
            rating: reviewForm.rating,
            advisorNotes: reviewForm.advisorNotes,
            lastReviewDate: new Date().toISOString().split('T')[0],
          }
        : submission
    );

    setSubmissions(updatedSubmissions);
    setIsReviewDialogOpen(false);
    setSelectedSubmission(null);
    
    toast({
      title: "Review Submitted",
      description: `Review for "${selectedSubmission.title}" has been saved successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "reviewed": return "secondary";
      case "pending": return "outline";
      case "needs-revision": return "destructive";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="w-4 h-4" />;
      case "reviewed": return <MessageCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "needs-revision": return <AlertCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const statsData = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    reviewed: submissions.filter(s => s.status === "reviewed").length,
    approved: submissions.filter(s => s.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Abstract Review</h2>
          <p className="text-gray-600">Review and provide feedback on student research submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.reviewed}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student & Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium">{submission.title}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {submission.studentName} ({submission.studentId})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {submission.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{submission.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1 w-fit">
                      {getStatusIcon(submission.status)}
                      <span>{submission.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.rating ? (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{submission.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDialog(submission)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Review</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Student Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedSubmission.title}</CardTitle>
                  <CardDescription>
                    By: {selectedSubmission.studentName} • ID: {selectedSubmission.studentId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Abstract:</Label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                        {selectedSubmission.abstract}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Keywords:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSubmission.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review & Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Review Status</Label>
                        <Select value={reviewForm.status} onValueChange={(value) => setReviewForm({...reviewForm, status: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="needs-revision">Needs Revision</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <Select value={reviewForm.rating.toString()} onValueChange={(value) => setReviewForm({...reviewForm, rating: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Needs Major Improvement</SelectItem>
                            <SelectItem value="2">2 - Needs Improvement</SelectItem>
                            <SelectItem value="3">3 - Satisfactory</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="feedback">Student Feedback</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Provide constructive feedback for the student..."
                        className="min-h-32"
                        value={reviewForm.feedback}
                        onChange={(e) => setReviewForm({...reviewForm, feedback: e.target.value})}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitReview} className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Submit Review</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Faculty Reports Component
const FacultyReports: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Q3 Research Progress Summary",
      type: "progress",
      department: "Computer Science",
      dateRange: { start: "2024-07-01", end: "2024-09-30" },
      generatedBy: "Dr. Maria Santos",
      generatedAt: "2024-10-01",
      status: "completed",
      metrics: {
        totalAbstracts: 45,
        approvedAbstracts: 38,
        pendingReviews: 7,
        averageScore: 4.2,
        topKeywords: ["Machine Learning", "Deep Learning", "Computer Vision"],
        researchAreas: ["AI", "Data Science", "Computer Graphics"]
      }
    },
    {
      id: "2",
      title: "Student Research Trends Analysis",
      type: "analytics",
      department: "Computer Science",
      dateRange: { start: "2024-01-01", end: "2024-09-30" },
      generatedBy: "Dr. Juan Rodriguez",
      generatedAt: "2024-09-28",
      status: "completed",
      metrics: {
        totalAbstracts: 120,
        approvedAbstracts: 102,
        pendingReviews: 18,
        averageScore: 4.1,
        topKeywords: ["Neural Networks", "Data Analysis", "Web Development"],
        researchAreas: ["Machine Learning", "Software Engineering", "HCI"]
      }
    }
  ]);

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    title: "",
    type: "progress",
    department: "Computer Science",
    startDate: "",
    endDate: "",
    includeMetrics: true,
    includeVisualizations: true,
    format: "pdf"
  });

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: (reports.length + 1).toString(),
      title: generateForm.title,
      type: generateForm.type as any,
      department: generateForm.department,
      dateRange: { start: generateForm.startDate, end: generateForm.endDate },
      generatedBy: "Dr. Maria Santos",
      generatedAt: new Date().toISOString().split('T')[0],
      status: "generating",
      metrics: {
        totalAbstracts: Math.floor(Math.random() * 100) + 20,
        approvedAbstracts: Math.floor(Math.random() * 80) + 15,
        pendingReviews: Math.floor(Math.random() * 20) + 1,
        averageScore: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        topKeywords: ["Machine Learning", "Deep Learning", "Data Science"],
        researchAreas: ["AI", "Computer Science", "Engineering"]
      }
    };

    setReports([newReport, ...reports]);
    setIsGenerateDialogOpen(false);
    setGenerateForm({
      title: "",
      type: "progress",
      department: "Computer Science",
      startDate: "",
      endDate: "",
      includeMetrics: true,
      includeVisualizations: true,
      format: "pdf"
    });

    toast({
      title: "Report Generation Started",
      description: `"${newReport.title}" is being generated. You'll be notified when it's ready.`,
    });

    // Simulate report completion
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "completed" }
          : report
      ));
      
      toast({
        title: "Report Completed",
        description: `"${newReport.title}" is now available for download.`,
      });
    }, 3000);
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      toast({
        title: "Download Started",
        description: `Downloading "${report.title}" as PDF...`,
      });
      // Simulate download
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "generating": return <Badge className="bg-orange-500">Generating</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "progress": return <FileBarChart className="w-4 h-4" />;
      case "analytics": return <BarChart3 className="w-4 h-4" />;
      case "summary": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Summary statistics
  const summaryStats = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === "completed").length,
    totalAbstracts: reports.reduce((sum, r) => sum + (r.metrics?.totalAbstracts || 0), 0),
    averageScore: (reports.reduce((sum, r) => sum + (r.metrics?.averageScore || 0), 0) / reports.length).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Reports</h2>
          <p className="text-gray-600">Generate and access comprehensive departmental reports</p>
        </div>
        <Button onClick={() => setIsGenerateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalReports}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.completedReports}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abstracts Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalAbstracts}</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.averageScore}</p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-gray-600">{report.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                      {getReportTypeIcon(report.type)}
                      <span>{report.type}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(report.generatedAt).toLocaleDateString()}</div>
                      <div className="text-gray-600">by {report.generatedBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {report.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Score</span>
                <Badge className="bg-green-500">4.2/5.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Approval Rate</span>
                <Badge className="bg-blue-500">84%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Rate</span>
                <Badge className="bg-purple-500">92%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Review Time</span>
                <Badge variant="outline">3.2 days avg</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Title</Label>
              <Input
                placeholder="e.g., Q4 Research Progress Summary"
                value={generateForm.title}
                onChange={(e) => setGenerateForm({...generateForm, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={generateForm.type} onValueChange={(value) => setGenerateForm({...generateForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress Report</SelectItem>
                    <SelectItem value="analytics">Analytics Report</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={generateForm.department} onValueChange={(value) => setGenerateForm({...generateForm, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={generateForm.startDate}
                  onChange={(e) => setGenerateForm({...generateForm, startDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={generateForm.endDate}
                  onChange={(e) => setGenerateForm({...generateForm, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport}>
                <FileBarChart className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Profile Management Component
interface ProfileManagementProps {
  overviewStats: {
    totalAbstracts: number;
    pendingReviews: number;
    validatedEntities: number;
    studentsSupervised: number;
    newThisMonth: number;
    avgReviewTime: string;
  };
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ overviewStats }) => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
    department: profile?.department || "",
    position: profile?.position || "",
    bio: profile?.biography || "",
    research_interests: profile?.research_interests || [],
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: user?.email || "",
        department: profile.department || "",
        position: profile.position || "",
        bio: profile.biography || "",
        research_interests: profile.research_interests || [],
      });
    }
  }, [profile, user]);

  const handleUpdateProfile = async () => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          department: profileForm.department,
          position: profileForm.position,
          biography: profileForm.bio,
          research_interests: profileForm.research_interests,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile to get updated data
      await refreshProfile();
      
      setIsEditDialogOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Faculty: Starting logout...');
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      console.log('✅ Faculty: Logout successful, redirecting...');
      navigate("/login", { replace: true });
    } catch (error) {
      console.warn('⚠️ Faculty: Logout had issues but continuing:', error);
      toast({
        title: "Logged Out",
        description: "Session cleared. Redirecting to login...",
        variant: "default",
      });
      // Force redirect even if logout had issues
      window.localStorage.clear();
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
          <p className="text-gray-600">Manage your account settings and personal information</p>
        </div>
      </div>

      {/* My Statistics Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {overviewStats.pendingReviews}
                </span>
                <MessageCircle className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Avg: {overviewStats.avgReviewTime}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Students Supervised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {overviewStats.studentsSupervised}
                </span>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Active supervision
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Validated Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {overviewStats.validatedEntities}
                </span>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Research entities validated
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCircle className="w-5 h-5" />
              <span>Profile Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <UserCircle className="w-16 h-16 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">{profile?.full_name || "Faculty Member"}</h3>
                <p className="text-gray-600">{profile?.position || "Faculty"}</p>
                <Badge variant="secondary" className="mt-2">
                  {profile?.department || "Department"}
                </Badge>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user?.email}</span>
                </div>
              </div>

              <Button 
                onClick={() => setIsEditDialogOpen(true)} 
                className="w-full mt-4"
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <p className="text-gray-900">{profile?.department || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Position</Label>
                  <p className="text-gray-900">{profile?.position || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {profile?.biography || "No biography available. Click 'Edit Profile' to add your professional background and interests."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.research_interests && profile.research_interests.length > 0 ? (
                  profile.research_interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-600">No research interests specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal and professional information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileForm.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={profileForm.department} 
                  onValueChange={(value) => setProfileForm({...profileForm, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Institute for Business Management">Institute for Business Management</SelectItem>
                    <SelectItem value="Institute for Computer Studies">Institute for Computer Studies</SelectItem>
                    <SelectItem value="Institute for Teacher Education">Institute for Teacher Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Enter your position"
                  value={profileForm.position}
                  onChange={(e) => setProfileForm({...profileForm, position: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your background, expertise, and interests..."
                className="min-h-32"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="research_interests">Research Interests (comma-separated)</Label>
              <Input
                id="research_interests"
                placeholder="Machine Learning, Data Science, Computer Vision"
                value={profileForm.research_interests.join(", ")}
                onChange={(e) => setProfileForm({
                  ...profileForm, 
                  research_interests: e.target.value.split(",").map(item => item.trim()).filter(Boolean)
                })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FacultyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // OCR Visualization state
  const [visualizationData, setVisualizationData] = useState<{
    text: string;
    entities: Array<{
      id: string;
      label: string;
      types: string[];
      confidence: number;
      abstract?: string;
      uri?: string;
    }>;
  } | null>(null);
  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false);

  const handleVisualizationData = (data: { text: string; entities: any[] }) => {
    setVisualizationData(data);
    setIsVisualizationModalOpen(true);
  };

  const handleCloseVisualizationModal = () => {
    setIsVisualizationModalOpen(false);
  };

  // Mock data for overview cards
  const overviewStats = {
    totalAbstracts: 24,
    pendingReviews: 7,
    validatedEntities: 156,
    studentsSupervised: 12,
    newThisMonth: 5,
    avgReviewTime: "2.3 days"
  };

  const recentActivities = [
    {
      id: 1,
      type: "review",
      description: "Reviewed abstract: 'Machine Learning Applications in Agriculture'",
      student: "John Doe",
      time: "2 hours ago",
      status: "approved"
    },
    {
      id: 2,
      type: "upload",
      description: "Uploaded research abstract: 'IoT in Smart Cities'",
      time: "1 day ago",
      status: "published"
    },
    {
      id: 3,
      type: "validation",
      description: "Validated 15 entities for Computer Science domain",
      time: "2 days ago",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage research abstracts, review submissions, and analyze academic trends
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Faculty Portal
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Calendar className="w-4 h-4 mr-1" />
              Academic Year 2024-2025
            </Badge>
            
            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-3 border-l pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || "Faculty Member"}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center space-x-1"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    try {
                      await logout();
                      toast({
                        title: "Logged Out",
                        description: "You have been successfully logged out.",
                      });
                      navigate("/login");
                    } catch (error) {
                      toast({
                        title: "Logout Failed",
                        description: "Failed to logout. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-8 lg:w-fit gap-1">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Student Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Visualization</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileBarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            {/* v2.0: New Admin Features for Faculty */}
            <TabsTrigger value="all-abstracts" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Abstracts Library</span>
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center space-x-2">
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">OCR</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - v2.0: Enhanced with system-wide admin statistics */}
          <TabsContent value="overview" className="space-y-6">
            {/* System-Wide Statistics (Admin-level view) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
              <AdminStatsCards />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Trends</CardTitle>
                  <CardDescription>
                    Abstract submissions over time and user distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Submissions</h4>
                    <SubmissionsChart />
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">User Distribution</h4>
                    <UserDistributionChart />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Domain Distribution</CardTitle>
                  <CardDescription>
                    Breakdown by research category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResearchDomainChart />
                </CardContent>
              </Card>
            </div>

            {/* Entity Analytics and Research Trends - Two Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Pane - Research Trends Graph */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Trends (2020-2025)</CardTitle>
                  <CardDescription>
                    Yearly growth of entities, keywords, and research domains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EntityAnalyticsChart />
                </CardContent>
              </Card>

              {/* Right Pane - Research Trends Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Trends</CardTitle>
                  <CardDescription>
                    Top research categories by paper count (2025)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Machine Learning</span>
                        <span className="text-sm text-gray-600">45 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Web Development</span>
                        <span className="text-sm text-gray-600">38 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '76%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Data Science</span>
                        <span className="text-sm text-gray-600">32 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '64%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Mobile Development</span>
                        <span className="text-sm text-gray-600">28 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '56%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Artificial Intelligence</span>
                        <span className="text-sm text-gray-600">25 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full" style={{width: '50%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Cybersecurity</span>
                        <span className="text-sm text-gray-600">22 papers</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{width: '44%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest system-wide actions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        {activity.type === "review" && <Eye className="w-5 h-5 text-blue-500 mt-1" />}
                        {activity.type === "upload" && <Upload className="w-5 h-5 text-green-500 mt-1" />}
                        {activity.type === "validation" && <CheckCircle className="w-5 h-5 text-purple-500 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        {activity.student && (
                          <p className="text-sm text-gray-500">
                            Student: {activity.student}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={
                            activity.status === "approved" ? "default" :
                            activity.status === "published" ? "secondary" : "outline"
                          }
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
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
                <CardDescription>
                  Common tasks and administrative shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("reviews")}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs text-center">Review Submissions</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileBarChart className="w-6 h-6" />
                    <span className="text-xs text-center">Generate Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-xs text-center">Manage Users</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab("ocr")}
                  >
                    <Scan className="w-6 h-6" />
                    <span className="text-xs text-center">OCR Extraction</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="reviews">
            <StudentAbstractReview />
          </TabsContent>

          <TabsContent value="visualization">
            <FacultyVisualization />
          </TabsContent>

          <TabsContent value="reports">
            <FacultyReports />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement overviewStats={overviewStats} />
          </TabsContent>

          {/* v2.0: New Admin Feature Tabs for Faculty */}
          <TabsContent value="all-abstracts" className="space-y-6">
            <AbstractsLibrary isFacultyMode={true} />
          </TabsContent>

          <TabsContent value="ocr" className="space-y-6">
            <Card>
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
                <OCRExtractor onVisualizationData={handleVisualizationData} />
              </CardContent>
            </Card>

            {/* Entity Visualization Modal */}
            {visualizationData && visualizationData.entities && visualizationData.entities.length > 0 && (
              <SimpleEntityGraph
                data={visualizationData}
                isOpen={isVisualizationModalOpen}
                onClose={handleCloseVisualizationModal}
              />
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage all users, view activity, and monitor system access
                </CardDescription>
              </CardHeader>
            </Card>
            <UserManagement />
            
            {/* System Monitoring */}
            <SystemMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyDashboard;
