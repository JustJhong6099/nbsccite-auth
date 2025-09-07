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
  XCircle
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

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === "all" || submission.status === filterStatus
  );

  const statsData = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    reviewed: submissions.filter(s => s.status === "reviewed").length,
    approved: submissions.filter(s => s.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Abstract Review</h2>
          <p className="text-gray-600">Review and provide feedback on student research submissions</p>
        </div>
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

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label>Status Filter:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs-revision">Needs Revision</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            Review and provide feedback on student research abstracts
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
    </div>
  );
};

export default StudentAbstractReview;
