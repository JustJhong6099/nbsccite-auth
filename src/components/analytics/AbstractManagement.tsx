import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Tag,
  User,
  Calendar,
  MoreHorizontal,
  Zap,
  Brain,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for abstracts
const mockAbstracts = [
  {
    id: '1',
    title: 'Machine Learning Approaches for Natural Language Processing in Educational Systems',
    author: 'John Smith',
    author_email: 'john.smith@student.nbsc.edu',
    submission_date: '2024-01-15',
    status: 'approved',
    abstract_text: 'This research explores the application of machine learning techniques in natural language processing for educational systems. We focus on developing intelligent tutoring systems that can understand and respond to student queries in natural language...',
    keywords: ['Machine Learning', 'NLP', 'Python', 'TensorFlow', 'Education', 'AI'],
    entities: {
      technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'NLTK'],
      domains: ['Machine Learning', 'Natural Language Processing', 'Educational Technology'],
      confidence: 0.92
    },
    file_url: '/uploads/abstract_1.pdf',
    reviewed_by: 'Dr. Sarah Johnson',
    review_date: '2024-01-16'
  },
  {
    id: '2',
    title: 'Web Development Using React and Node.js for E-commerce Applications',
    author: 'Maria Garcia',
    author_email: 'maria.garcia@student.nbsc.edu',
    submission_date: '2024-01-14',
    status: 'pending',
    abstract_text: 'This project focuses on developing a comprehensive e-commerce platform using modern web technologies. The frontend is built with React.js, providing a responsive and user-friendly interface...',
    keywords: ['React', 'Node.js', 'JavaScript', 'Web Development', 'E-commerce', 'MongoDB'],
    entities: {
      technologies: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express.js'],
      domains: ['Web Development', 'E-commerce', 'Full-stack Development'],
      confidence: 0.88
    },
    file_url: '/uploads/abstract_2.pdf',
    reviewed_by: null,
    review_date: null
  },
  {
    id: '3',
    title: 'Database Optimization Techniques in PostgreSQL for Large-scale Applications',
    author: 'Ahmed Hassan',
    author_email: 'ahmed.hassan@student.nbsc.edu',
    submission_date: '2024-01-13',
    status: 'rejected',
    abstract_text: 'This study investigates various database optimization techniques specifically for PostgreSQL in large-scale applications. We examine indexing strategies, query optimization, and performance tuning...',
    keywords: ['Database', 'PostgreSQL', 'Optimization', 'SQL', 'Performance'],
    entities: {
      technologies: ['PostgreSQL', 'SQL', 'Redis', 'Docker'],
      domains: ['Database Systems', 'Performance Optimization', 'DevOps'],
      confidence: 0.85
    },
    file_url: '/uploads/abstract_3.pdf',
    reviewed_by: 'Prof. Michael Chen',
    review_date: '2024-01-14',
    rejection_reason: 'Insufficient technical depth and lack of novel contributions.'
  },
  {
    id: '4',
    title: 'Mobile Application Development for Healthcare Management using Flutter',
    author: 'Sarah Wilson',
    author_email: 'sarah.wilson@student.nbsc.edu',
    submission_date: '2024-01-12',
    status: 'under_review',
    abstract_text: 'This research presents the development of a comprehensive healthcare management mobile application using Flutter framework. The application aims to improve patient-doctor communication...',
    keywords: ['Flutter', 'Mobile Development', 'Healthcare', 'Firebase', 'Dart'],
    entities: {
      technologies: ['Flutter', 'Dart', 'Firebase', 'SQLite'],
      domains: ['Mobile Development', 'Healthcare Technology', 'Cross-platform Development'],
      confidence: 0.90
    },
    file_url: '/uploads/abstract_4.pdf',
    reviewed_by: 'Dr. Sarah Johnson',
    review_date: null
  }
];

interface Abstract {
  id: string;
  title: string;
  author: string;
  author_email: string;
  submission_date: string;
  status: string;
  abstract_text: string;
  keywords: string[];
  entities: {
    technologies: string[];
    domains: string[];
    confidence: number;
  };
  file_url: string;
  reviewed_by: string | null;
  review_date: string | null;
  rejection_reason?: string;
}

export const AbstractManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAbstract, setSelectedAbstract] = useState<Abstract | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredAbstracts = mockAbstracts.filter(abstract => {
    const matchesSearch = abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abstract.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abstract.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || abstract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) {
      return <Badge className="bg-green-100 text-green-800">High ({percentage}%)</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium ({percentage}%)</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Low ({percentage}%)</Badge>;
    }
  };

  const handleViewAbstract = (abstract: Abstract) => {
    setSelectedAbstract(abstract);
    setIsViewDialogOpen(true);
  };

  const handleReviewAbstract = (abstract: Abstract, action: 'approve' | 'reject') => {
    setSelectedAbstract(abstract);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const stats = {
    total: mockAbstracts.length,
    pending: mockAbstracts.filter(a => a.status === 'pending').length,
    approved: mockAbstracts.filter(a => a.status === 'approved').length,
    rejected: mockAbstracts.filter(a => a.status === 'rejected').length,
    under_review: mockAbstracts.filter(a => a.status === 'under_review').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Abstract Management</h2>
          <p className="text-gray-600">Review and manage research abstract submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Abstracts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.under_review}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Abstract Submissions</CardTitle>
              <CardDescription>Review submissions and validate entity extraction</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search abstracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Abstract</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entities</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAbstracts.map((abstract) => (
                  <TableRow key={abstract.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium text-sm">{abstract.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {abstract.abstract_text.substring(0, 100)}...
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {abstract.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {abstract.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{abstract.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{abstract.author}</div>
                        <div className="text-xs text-gray-500">{abstract.author_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(abstract.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          <strong>Tech:</strong> {abstract.entities.technologies.slice(0, 2).join(', ')}
                          {abstract.entities.technologies.length > 2 && ` +${abstract.entities.technologies.length - 2}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Domain:</strong> {abstract.entities.domains.slice(0, 1).join(', ')}
                          {abstract.entities.domains.length > 1 && ` +${abstract.entities.domains.length - 1}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getConfidenceBadge(abstract.entities.confidence)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(abstract.submission_date)}
                      </div>
                      {abstract.reviewed_by && (
                        <div className="text-xs text-gray-500">
                          by {abstract.reviewed_by}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewAbstract(abstract)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Zap className="h-4 w-4 mr-2" />
                            Re-extract Entities
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {abstract.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleReviewAbstract(abstract, 'approve')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReviewAbstract(abstract, 'reject')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Abstract Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abstract Details</DialogTitle>
            <DialogDescription>
              Complete abstract information and extracted entities
            </DialogDescription>
          </DialogHeader>
          {selectedAbstract && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <p className="text-sm mt-1">{selectedAbstract.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Author</Label>
                  <p className="text-sm mt-1">{selectedAbstract.author}</p>
                  <p className="text-xs text-gray-500">{selectedAbstract.author_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Submission Date</Label>
                  <p className="text-sm mt-1">{formatDate(selectedAbstract.submission_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedAbstract.status)}</div>
                </div>
              </div>

              {/* Abstract Text */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Abstract</Label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-justify">{selectedAbstract.abstract_text}</p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Keywords</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedAbstract.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Extracted Technologies</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAbstract.entities.technologies.map((tech, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        <Brain className="h-3 w-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Research Domains</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAbstract.entities.domains.map((domain, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800">
                        <FileText className="h-3 w-3 mr-1" />
                        {domain}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Entity Extraction Confidence</Label>
                <div className="mt-2 flex items-center gap-4">
                  {getConfidenceBadge(selectedAbstract.entities.confidence)}
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${selectedAbstract.entities.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(selectedAbstract.entities.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Review Information */}
              {selectedAbstract.reviewed_by && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Label className="text-sm font-medium text-blue-800">Review Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">
                      <strong>Reviewed by:</strong> {selectedAbstract.reviewed_by}
                    </p>
                    {selectedAbstract.review_date && (
                      <p className="text-sm text-blue-700">
                        <strong>Review date:</strong> {formatDate(selectedAbstract.review_date)}
                      </p>
                    )}
                    {selectedAbstract.rejection_reason && (
                      <p className="text-sm text-red-700">
                        <strong>Rejection reason:</strong> {selectedAbstract.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Abstract Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Abstract' : 'Reject Abstract'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Confirm approval of this abstract submission.'
                : 'Please provide a reason for rejecting this abstract.'
              }
            </DialogDescription>
          </DialogHeader>
          {selectedAbstract && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Abstract</Label>
                <p className="text-sm mt-1">{selectedAbstract.title}</p>
                <p className="text-xs text-gray-500">by {selectedAbstract.author}</p>
              </div>
              
              {reviewAction === 'reject' && (
                <div>
                  <Label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700">
                    Reason for Rejection
                  </Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a detailed reason for rejecting this abstract..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
            >
              {reviewAction === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Abstract
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Abstract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
