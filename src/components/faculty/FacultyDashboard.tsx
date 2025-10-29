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
import { ResearchInsights } from "@/components/student/ResearchInsights";

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
import { AbstractsLibrary } from "@/components/student/AbstractsLibrary";
// New comprehensive charts for Overview section
import { SubmissionTrendsChart } from "@/components/analytics/SubmissionTrendsChart";
import { EntityDistributionChart } from "@/components/analytics/EntityDistributionChart";
import { TopResearchDomainsChart } from "@/components/analytics/TopResearchDomainsChart";
import { ReviewPerformanceCard } from "@/components/analytics/ReviewPerformanceCard";
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
  extractedEntities?: any;
  extractionConfidence?: number;
  year?: number;
  authors?: string[];
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
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch submissions from database
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch abstracts first
      const { data: abstractsData, error: abstractsError } = await supabase
        .from('abstracts')
        .select('*')
        .order('submitted_date', { ascending: false });

      if (abstractsError) throw abstractsError;

      // Fetch profiles for all student_ids
      const studentIds = abstractsData?.map(a => a.student_id).filter(Boolean) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_id')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by id for quick lookup
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p]) || []
      );

      const data = abstractsData?.map(abstract => ({
        ...abstract,
        profiles: profilesMap.get(abstract.student_id)
      }));

      console.log('Fetched abstracts:', data);
      console.log('Number of submissions:', data?.length || 0);

      // Transform data to match StudentSubmission interface
      const transformedSubmissions: StudentSubmission[] = (data || []).map(abstract => {
        const profile = Array.isArray(abstract.profiles) ? abstract.profiles[0] : abstract.profiles;
        
        return {
          id: abstract.id,
          title: abstract.title,
          studentName: profile?.full_name || 'Unknown Student',
          studentEmail: profile?.email || '',
          studentId: profile?.student_id || '',
          submittedDate: abstract.submitted_date ? new Date(abstract.submitted_date).toISOString().split('T')[0] : '',
          status: abstract.status as any,
          abstract: abstract.abstract_text,
          keywords: abstract.keywords || [],
          department: abstract.department || '',
          lastReviewDate: abstract.reviewed_date ? new Date(abstract.reviewed_date).toISOString().split('T')[0] : undefined,
          extractedEntities: abstract.extracted_entities,
          extractionConfidence: abstract.entity_extraction_confidence,
          year: abstract.year,
          authors: abstract.authors || []
        };
      });

      setSubmissions(transformedSubmissions);
      console.log('Transformed submissions:', transformedSubmissions);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  // D3.js visualization state for review modal
  const graphRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
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
    
    // Build entity graph after modal opens
    setTimeout(() => {
      if (submission.extractedEntities) {
        buildEntityGraph(submission.extractedEntities);
      }
    }, 100);
  };

  // Build D3.js entity relationship graph with advanced physics and animations
  const buildEntityGraph = (entities: any) => {
    if (!graphRef.current || !entities) return;

    const svg = d3.select(graphRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomLevel(Math.round(event.transform.k * 100));
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Add a container group for all elements
    const container = svg.append("g");

    // Collect all entities from extracted data
    const allEntities: string[] = [
      ...(entities.technologies || []),
      ...(entities.domains || []),
      ...(entities.methodologies || [])
    ];

    // Remove duplicates (case-insensitive)
    const seenEntities = new Set<string>();
    const uniqueEntities = allEntities.filter((entity: string) => {
      const normalized = entity.toLowerCase().trim();
      if (seenEntities.has(normalized)) {
        return false;
      }
      seenEntities.add(normalized);
      return true;
    });

    // Create nodes: 1 center node + entity nodes
    const nodes: any[] = [
      { id: 'center', label: 'Abstract Center', type: 'center', x: width / 2, y: height / 2 }
    ];

    uniqueEntities.forEach((entity: string, index: number) => {
      nodes.push({
        id: `entity-${index}`,
        label: entity,
        type: 'entity'
      });
    });

    // Create links from center to entities
    const links: any[] = uniqueEntities.map((_: string, index: number) => ({
      source: 'center',
      target: `entity-${index}`
    }));

    // Create force simulation with improved physics
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    simulationRef.current = simulation;

    // Create links with better styling
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Create node groups with drag and hover interactions
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "grab")
      .call(d3.drag<SVGGElement, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          d3.select(event.currentTarget).style("cursor", "grabbing");
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          d3.select(event.currentTarget).style("cursor", "grab");
        })
      );

    // Add circles to nodes with hover effects and animations
    node.append("circle")
      .attr("r", (d: any) => d.type === 'center' ? 45 : 30)
      .attr("fill", (d: any) => d.type === 'center' ? "#3b82f6" : "#fb923c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .on("mouseover", function(event, d) {
        // Highlight node with smooth animation
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.type === 'center' ? 50 : 35)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");
        
        // Highlight connected links
        link.style("stroke-opacity", (l: any) => 
          (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2
        )
        .style("stroke-width", (l: any) => 
          (l.source.id === d.id || l.target.id === d.id) ? 3 : 2
        );
      })
      .on("mouseout", function() {
        // Reset node with smooth animation
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.type === 'center' ? 45 : 30)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
        
        // Reset all links
        link.style("stroke-opacity", 0.6)
          .style("stroke-width", 2);
      });

    // Add labels below nodes with better styling
    node.append("text")
      .text((d: any) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d: any) => d.type === 'center' ? 60 : 45)
      .attr("font-size", (d: any) => d.type === 'center' ? "13px" : "11px")
      .attr("fill", "#1f2937")
      .attr("font-weight", (d: any) => d.type === 'center' ? "600" : "500")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Update positions with smooth animation
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
  };

  // Zoom control functions
  const handleZoomIn = () => {
    if (graphRef.current && zoomBehaviorRef.current) {
      d3.select(graphRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current && zoomBehaviorRef.current) {
      d3.select(graphRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (graphRef.current && zoomBehaviorRef.current) {
      d3.select(graphRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;

    try {
      // Update status in database
      const { error } = await supabase
        .from('abstracts')
        .update({
          status: 'approved',
          reviewed_date: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      // Update local state
      const updatedSubmissions = submissions.map(submission =>
        submission.id === selectedSubmission.id
          ? {
              ...submission,
              status: "approved" as any,
              lastReviewDate: new Date().toISOString().split('T')[0],
            }
          : submission
      );

      setSubmissions(updatedSubmissions);
      setIsReviewDialogOpen(false);
      setSelectedSubmission(null);
      
      toast({
        title: "Abstract Approved",
        description: `"${selectedSubmission.title}" has been approved successfully.`,
      });
    } catch (error) {
      console.error('Error approving abstract:', error);
      toast({
        title: "Error",
        description: "Failed to approve abstract. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !user) return;

    try {
      // Update status in database
      const { error } = await supabase
        .from('abstracts')
        .update({
          status: 'rejected',
          reviewed_date: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      // Update local state
      const updatedSubmissions = submissions.map(submission =>
        submission.id === selectedSubmission.id
          ? {
              ...submission,
              status: "rejected" as any,
              lastReviewDate: new Date().toISOString().split('T')[0],
            }
          : submission
      );

      setSubmissions(updatedSubmissions);
      setIsReviewDialogOpen(false);
      setSelectedSubmission(null);
      
      toast({
        title: "Abstract Rejected",
        description: `"${selectedSubmission.title}" has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error rejecting abstract:', error);
      toast({
        title: "Error",
        description: "Failed to reject abstract. Please try again.",
        variant: "destructive",
      });
    }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-600">Loading submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-500 max-w-sm">
                Student abstract submissions will appear here once they are submitted for review.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student & Title</TableHead>
                  <TableHead>Status</TableHead>
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
                      <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1 w-fit">
                        {getStatusIcon(submission.status)}
                        <span>{submission.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </Badge>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Student Submission</DialogTitle>
            <DialogDescription>
              Review the abstract, extracted entities, and entity relationships
            </DialogDescription>
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
                      <Label className="text-sm font-medium">Department:</Label>
                      <p className="mt-1 text-sm text-gray-700">{selectedSubmission.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Submitted Date:</Label>
                      <p className="mt-1 text-sm text-gray-700">{selectedSubmission.submittedDate}</p>
                    </div>
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

              {/* Extracted Entities Section */}
              {selectedSubmission.extractedEntities && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Extracted Entities</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {selectedSubmission.extractionConfidence 
                        ? Math.round(selectedSubmission.extractionConfidence * 100) 
                        : 0}% Confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Technologies - Left */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                        Technologies
                      </Label>
                      <div className="mt-2 space-y-1">
                        {selectedSubmission.extractedEntities.technologies && 
                         selectedSubmission.extractedEntities.technologies.length > 0 ? (
                          selectedSubmission.extractedEntities.technologies.map((tech: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 mr-2 mb-2">
                              {tech}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">None detected</p>
                        )}
                      </div>
                    </div>

                    {/* Research Domains - Right */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                        Research Domains
                      </Label>
                      <div className="mt-2 space-y-1">
                        {selectedSubmission.extractedEntities.domains && 
                         selectedSubmission.extractedEntities.domains.length > 0 ? (
                          selectedSubmission.extractedEntities.domains.map((domain: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 mr-2 mb-2">
                              {domain}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">None detected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Methodologies - Full Width */}
                  {selectedSubmission.extractedEntities.methodologies && 
                   selectedSubmission.extractedEntities.methodologies.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        Methodologies
                      </Label>
                      <div className="mt-2 space-y-1">
                        {selectedSubmission.extractedEntities.methodologies.map((method: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 mr-2 mb-2">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Entity Graph */}
                  <div className="border rounded-lg bg-gray-50">
                    <div className="relative bg-white rounded-lg border overflow-hidden" style={{ height: '400px' }}>
                      <svg ref={graphRef} className="w-full h-full"></svg>
                      
                      {/* Overlay Controls - Top Left */}
                      <div className="absolute top-3 left-3 space-y-2 pointer-events-none">
                        {/* Title and Legend */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border pointer-events-auto">
                          <div className="flex items-center gap-4">
                            <h4 className="text-sm font-semibold text-gray-900">Interactive Entity Graph</h4>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                                <span className="text-gray-600">Abstract Center</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                                <span className="text-gray-600">Extracted Entities</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Interactive Instructions */}
                        <div className="bg-blue-50/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-blue-200 pointer-events-auto">
                          <div className="text-xs text-blue-800 space-y-0.5">
                            <div className="font-semibold mb-1">How to interact:</div>
                            <div>• <span className="font-medium">Hover over nodes</span> for details</div>
                            <div>• <span className="font-medium">Drag nodes</span> to rearrange</div>
                            <div>• <span className="font-medium">Blue:</span> Central abstract</div>
                            <div>• <span className="font-medium">Orange:</span> Entity keywords</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Zoom Controls - Top Right */}
                      <div className="absolute top-3 right-3 pointer-events-auto">
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleZoomIn}
                            className="h-8 w-8 p-0"
                            title="Zoom In"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleZoomOut}
                            className="h-8 w-8 p-0"
                            title="Zoom Out"
                          >
                            <span className="text-xl leading-none">−</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleResetZoom}
                            className="h-8 w-8 p-0"
                            title="Reset View"
                          >
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReject}
                  className="flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </Button>
              </div>
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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-1">
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
            <TabsTrigger value="research-insights" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Research Insights</span>
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

            {/* New Comprehensive Charts - Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submission Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Submission Trends
                  </CardTitle>
                  <CardDescription>
                    Track submission activity by week or month with status breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubmissionTrendsChart />
                </CardContent>
              </Card>

              {/* Entity Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Entity Distribution
                  </CardTitle>
                  <CardDescription>
                    Technologies, domains, and methodologies breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EntityDistributionChart />
                </CardContent>
              </Card>
            </div>

            {/* New Comprehensive Charts - Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Research Domains Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Top Research Domains
                  </CardTitle>
                  <CardDescription>
                    Most popular research areas across all submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopResearchDomainsChart />
                </CardContent>
              </Card>

              {/* Review Performance Card */}
              <ReviewPerformanceCard />
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

          {/* v2.0: New Admin Feature Tabs for Faculty */}
          <TabsContent value="all-abstracts" className="space-y-6">
            <AbstractsLibrary isFacultyMode={true} />
          </TabsContent>

          <TabsContent value="research-insights" className="space-y-6">
            <ResearchInsights />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileManagement overviewStats={overviewStats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* Merged User Distribution and Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution & Statistics</CardTitle>
                <CardDescription>
                  Breakdown of users by role with real-time statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: User Distribution Chart */}
                  <div>
                    <UserDistributionChart />
                  </div>

                  {/* Right: Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">9</p>
                      <p className="text-xs text-gray-600">Total Users</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <UserCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">5</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">4</p>
                      <p className="text-xs text-gray-600">Faculty</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">9</p>
                      <p className="text-xs text-gray-600">Active Users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Width User Management Component */}
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
