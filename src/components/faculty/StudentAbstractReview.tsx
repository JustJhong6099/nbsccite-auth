import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  MessageCircle, 
  Check, 
  X, 
  Clock, 
  User, 
  Calendar,
  Edit,
  Send,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Archive,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      abstract: "This research investigates the application of deep learning techniques for medical image analysis, focusing on early disease detection through computer vision algorithms...",
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
      abstract: "This study explores the implementation of IoT sensors and devices in sustainable agricultural practices...",
      keywords: ["IoT", "Agriculture", "Sustainability", "Smart Farming"],
      department: "Agriculture",
      feedback: "Good research direction. Please expand on the methodology section and include more recent literature review.",
      rating: 4,
      lastReviewDate: "2024-09-04",
    },
    {
      id: "3",
      title: "Blockchain Implementation in Supply Chain Management",
      studentName: "Mike Johnson",
      studentEmail: "mike.johnson@nbsc.edu.ph",
      studentId: "2024-IT-012",
      submittedDate: "2024-09-01",
      status: "approved",
      abstract: "This research examines the potential of blockchain technology in enhancing supply chain transparency and efficiency...",
      keywords: ["Blockchain", "Supply Chain", "Transparency", "Technology"],
      department: "Information Technology",
      feedback: "Excellent work! The methodology is sound and the results are well-presented. Ready for publication.",
      rating: 5,
      lastReviewDate: "2024-09-02",
    },
    {
      id: "4",
      title: "STUDENT VIOLATION MANAGEMENT AND INFORMATION SYSTEM WITH DATA ANALYTICS FOR THE PREFECT OF DISCIPLINE OFFICE IN NORTHERN BUKIDNON STATE COLLEGE",
      studentName: "Super Jhong",
      studentEmail: "super.jhong@nbsc.edu.ph",
      studentId: "2024-CS-007",
      submittedDate: "2024-08-20",
      status: "approved",
      abstract: "This system aims to digitize and streamline the violation management process in the Prefect of Discipline Office...",
      keywords: ["DATA PRIVACY", "DATA ANALYTICS", "PREFECT OF DISCIPLINE"],
      department: "Computer Science",
      feedback: "Outstanding research with practical applications. Approved for implementation.",
      rating: 5,
      lastReviewDate: "2024-08-25",
    },
    {
      id: "5",
      title: "E-RECORDTA: DEVELOPING A SECURE FILE MANAGAMENT SYSTEM WITH ADVANCED ENCRYPTION STANDARD FOR CONFIDENTIAL DATA IN THE MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE",
      studentName: "Just Jhong",
      studentEmail: "just.jhong@nbsc.edu.ph",
      studentId: "2024-CS-010",
      submittedDate: "2024-08-15",
      status: "approved",
      abstract: "Development of a secure document management system with AES encryption for protecting sensitive social welfare records...",
      keywords: ["AES ENCRYPTION", "DATA SECURITY", "MSWD"],
      department: "Computer Science",
      feedback: "Well-researched security implementation. Approved for deployment.",
      rating: 5,
      lastReviewDate: "2024-08-18",
    },
    {
      id: "6",
      title: "WEB-BASED SUPPLY MANAGEMENT AND INVENTORY SYSTEM FOR NORTHERN BUKIDNON STATE COLLEGE",
      studentName: "Just Jhong",
      studentEmail: "just.jhong@nbsc.edu.ph",
      studentId: "2024-CS-010",
      submittedDate: "2024-07-10",
      status: "rejected",
      abstract: "A web-based system for managing supplies and inventory tracking in the college...",
      keywords: ["SUPPLY MANAGEMENT SYSTEM", "INVENTORY MANAGEMENT SYSTEM", "WEB-BASED"],
      department: "Computer Science",
      feedback: "The research lacks sufficient originality and the methodology needs significant improvement. Please revise and resubmit with more innovative approaches.",
      rating: 2,
      lastReviewDate: "2024-07-15",
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

  const [filterStatus, setFilterStatus] = useState("all");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveFilterStatus, setArchiveFilterStatus] = useState<"approved" | "rejected" | "all">("all");

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

  // Separate active submissions (pending, reviewed, needs-revision) from archived (approved, rejected)
  const activeSubmissions = submissions.filter(s => 
    s.status === "pending" || s.status === "reviewed" || s.status === "needs-revision"
  );
  
  const archivedSubmissions = submissions.filter(s => 
    s.status === "approved" || s.status === "rejected"
  );

  const filteredSubmissions = activeSubmissions.filter(submission => 
    filterStatus === "all" || submission.status === filterStatus
  );

  const filteredArchived = archivedSubmissions.filter(submission =>
    archiveFilterStatus === "all" || submission.status === archiveFilterStatus
  );

  const statsData = {
    total: activeSubmissions.length,
    pending: activeSubmissions.filter(s => s.status === "pending").length,
    reviewed: activeSubmissions.filter(s => s.status === "reviewed").length,
    archived: archivedSubmissions.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Abstract Review</h2>
          <p className="text-gray-600">Review and provide feedback on student research submissions</p>
        </div>
        <Button 
          onClick={() => setIsArchiveModalOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          View Archive ({archivedSubmissions.length})
        </Button>
      </div>

      {/* Stats Cards */}
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

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{statsData.archived}</p>
              </div>
              <Archive className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Active Submissions</CardTitle>
          <CardDescription>
            Approved and rejected submissions are in the archive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label>Status Filter:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Under Review</SelectItem>
                <SelectItem value="needs-revision">Needs Revision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            Review and provide feedback on pending student research abstracts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student & Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
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
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(submission.submittedDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(submission.status)} className="flex items-center space-x-1">
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
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(submission)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Review</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Student Submission</DialogTitle>
            <DialogDescription>
              Provide feedback and evaluation for the student's research abstract
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedSubmission.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <span>By: {selectedSubmission.studentName}</span>
                      <span>•</span>
                      <span>ID: {selectedSubmission.studentId}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(selectedSubmission.submittedDate).toLocaleDateString()}</span>
                    </div>
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

              {/* Review Form */}
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
                            <SelectItem value="pending">Pending Review</SelectItem>
                            <SelectItem value="reviewed">Under Review</SelectItem>
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
                            <SelectItem value="0">Not Rated</SelectItem>
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

                    <div className="space-y-2">
                      <Label htmlFor="advisorNotes">Private Advisor Notes</Label>
                      <Textarea
                        id="advisorNotes"
                        placeholder="Internal notes (not visible to student)..."
                        className="min-h-24"
                        value={reviewForm.advisorNotes}
                        onChange={(e) => setReviewForm({...reviewForm, advisorNotes: e.target.value})}
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

      {/* Archive Modal */}
      <Dialog open={isArchiveModalOpen} onOpenChange={setIsArchiveModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-purple-600" />
              Reviewed Abstracts Archive
            </DialogTitle>
            <DialogDescription>
              View all approved and rejected abstract submissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Archive Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Archived</p>
                      <p className="text-2xl font-bold text-gray-900">{archivedSubmissions.length}</p>
                    </div>
                    <Archive className="w-6 h-6 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-900">
                        {archivedSubmissions.filter(s => s.status === "approved").length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">
                        {archivedSubmissions.filter(s => s.status === "rejected").length}
                      </p>
                    </div>
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Archive Filter */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium">Filter:</Label>
              <Select 
                value={archiveFilterStatus} 
                onValueChange={(value: any) => setArchiveFilterStatus(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Archived</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="rejected">Rejected Only</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">
                Showing {filteredArchived.length} of {archivedSubmissions.length} archived submissions
              </span>
            </div>

            {/* Archive Table */}
            {filteredArchived.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student & Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review Date</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredArchived.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {submission.title}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <User className="w-3 h-3 mr-1" />
                                {submission.studentName} ({submission.studentId})
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {submission.keywords.map((keyword, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusColor(submission.status)}
                              className="flex items-center space-x-1 w-fit"
                            >
                              {getStatusIcon(submission.status)}
                              <span>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {submission.lastReviewDate 
                                ? new Date(submission.lastReviewDate).toLocaleDateString()
                                : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {submission.rating ? (
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < submission.rating!
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not rated</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openReviewDialog(submission)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Archived Submissions</h3>
                  <p className="text-gray-500">
                    {archiveFilterStatus === "all" 
                      ? "No approved or rejected submissions yet."
                      : `No ${archiveFilterStatus} submissions found.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsArchiveModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAbstractReview;
