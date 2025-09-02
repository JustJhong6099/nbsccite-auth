import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Edit, 
  Eye, 
  Download, 
  Calendar,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
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

// Mock data for student's abstracts
const mockAbstracts = [
  {
    id: '1',
    title: 'Machine Learning Applications in Educational Technology',
    abstract: 'This research explores the implementation of machine learning algorithms in educational platforms to enhance student learning outcomes. The study focuses on personalized learning paths, automated assessment systems, and predictive analytics for student performance.',
    keywords: ['Machine Learning', 'Education Technology', 'Personalized Learning', 'Assessment Systems'],
    research_area: 'Machine Learning',
    methodology: 'Mixed Methods',
    year: '2024',
    status: 'approved',
    submitted_date: '2024-01-15',
    review_date: '2024-01-18',
    reviewer: 'Dr. Sarah Johnson',
    file_name: 'ml_education_paper.pdf',
    feedback: 'Excellent research methodology and clear presentation of findings.',
    entity_extraction: {
      technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'Jupyter'],
      domains: ['Machine Learning', 'Educational Technology', 'Data Science'],
      confidence: 0.92
    }
  },
  {
    id: '2',
    title: 'Web Development Framework for E-commerce Applications',
    abstract: 'This project focuses on developing a comprehensive e-commerce platform using modern web technologies. The frontend is built with React.js, providing a responsive and user-friendly interface.',
    keywords: ['React', 'Node.js', 'E-commerce', 'Web Development', 'JavaScript'],
    research_area: 'Web Development',
    methodology: 'Case Study',
    year: '2024',
    status: 'under_review',
    submitted_date: '2024-01-10',
    review_date: null,
    reviewer: 'Prof. Michael Chen',
    file_name: 'ecommerce_framework.pdf',
    feedback: null,
    entity_extraction: {
      technologies: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express.js'],
      domains: ['Web Development', 'E-commerce', 'Full-stack Development'],
      confidence: 0.88
    }
  },
  {
    id: '3',
    title: 'Database Optimization Techniques in PostgreSQL',
    abstract: 'This study investigates various database optimization techniques specifically for PostgreSQL in large-scale applications. We examine indexing strategies, query optimization, and performance tuning.',
    keywords: ['Database', 'PostgreSQL', 'Optimization', 'Performance', 'SQL'],
    research_area: 'Database Systems',
    methodology: 'Experimental Design',
    year: '2023',
    status: 'rejected',
    submitted_date: '2023-12-15',
    review_date: '2023-12-20',
    reviewer: 'Dr. Amanda Liu',
    file_name: 'postgres_optimization.pdf',
    feedback: 'The methodology needs improvement and more comprehensive testing is required.',
    entity_extraction: {
      technologies: ['PostgreSQL', 'SQL', 'Python', 'Docker'],
      domains: ['Database Systems', 'Performance Optimization', 'DevOps'],
      confidence: 0.85
    }
  },
  {
    id: '4',
    title: 'Mobile Healthcare Application Development',
    abstract: 'Development of a mobile application for healthcare management using Flutter framework. The application aims to improve patient-doctor communication and appointment scheduling.',
    keywords: ['Flutter', 'Mobile Development', 'Healthcare', 'Dart', 'Firebase'],
    research_area: 'Mobile Development',
    methodology: 'Quantitative Research',
    year: '2024',
    status: 'draft',
    submitted_date: null,
    review_date: null,
    reviewer: null,
    file_name: null,
    feedback: null,
    entity_extraction: {
      technologies: ['Flutter', 'Dart', 'Firebase', 'Android', 'iOS'],
      domains: ['Mobile Development', 'Healthcare Technology', 'Cross-platform Development'],
      confidence: 0.90
    }
  }
];

export const MyAbstracts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAbstract, setSelectedAbstract] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAbstracts = mockAbstracts.filter(abstract => {
    const matchesSearch = abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abstract.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || abstract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const abstractsByStatus = {
    all: mockAbstracts,
    approved: mockAbstracts.filter(a => a.status === 'approved'),
    under_review: mockAbstracts.filter(a => a.status === 'under_review'),
    rejected: mockAbstracts.filter(a => a.status === 'rejected'),
    draft: mockAbstracts.filter(a => a.status === 'draft')
  };

  const handleViewAbstract = (abstract: any) => {
    setSelectedAbstract(abstract);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Abstracts</h2>
          <p className="text-gray-600">Manage your research submissions and track their status</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          New Abstract
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{abstractsByStatus.all.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{abstractsByStatus.approved.length}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{abstractsByStatus.under_review.length}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{abstractsByStatus.rejected.length}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{abstractsByStatus.draft.length}</div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Research Submissions</CardTitle>
              <CardDescription>Your abstract submissions and their current status</CardDescription>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({abstractsByStatus.all.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({abstractsByStatus.approved.length})</TabsTrigger>
              <TabsTrigger value="under_review">Under Review ({abstractsByStatus.under_review.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({abstractsByStatus.rejected.length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({abstractsByStatus.draft.length})</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {filteredAbstracts.map((abstract) => (
                <Card key={abstract.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {abstract.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(abstract.status)}
                              <Badge variant="outline">{abstract.research_area}</Badge>
                              <Badge variant="outline">{abstract.year}</Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewAbstract(abstract)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {abstract.status === 'draft' && (
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Draft
                                </DropdownMenuItem>
                              )}
                              {abstract.file_name && (
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download File
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {(abstract.status === 'rejected' || abstract.status === 'draft') && (
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Resubmit
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {abstract.abstract}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {abstract.keywords.slice(0, 4).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {abstract.keywords.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{abstract.keywords.length - 4} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {abstract.submitted_date ? (
                              <>Submitted {formatDate(abstract.submitted_date)}</>
                            ) : (
                              <>Draft created</>
                            )}
                          </div>
                          {abstract.reviewer && (
                            <div>Reviewer: {abstract.reviewer}</div>
                          )}
                        </div>

                        {abstract.feedback && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Reviewer Feedback</span>
                            </div>
                            <p className="text-sm text-blue-800">{abstract.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAbstracts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No abstracts found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by submitting your first research abstract.'
                    }
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Abstract Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Abstract Details</DialogTitle>
            <DialogDescription>
              Complete information about your research submission
            </DialogDescription>
          </DialogHeader>
          {selectedAbstract && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{selectedAbstract.title}</h3>
                  {getStatusBadge(selectedAbstract.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Research Area:</span>
                    <p>{selectedAbstract.research_area}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Methodology:</span>
                    <p>{selectedAbstract.methodology}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Year:</span>
                    <p>{selectedAbstract.year}</p>
                  </div>
                </div>
              </div>

              {/* Abstract Text */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Abstract</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedAbstract.abstract}</p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAbstract.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Entity Extraction */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Extracted Entities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Technologies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAbstract.entity_extraction.technologies.map((tech: string, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Domains:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAbstract.entity_extraction.domains.map((domain: string, index: number) => (
                        <Badge key={index} className="bg-purple-100 text-purple-800 text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-600">Confidence Score:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedAbstract.entity_extraction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(selectedAbstract.entity_extraction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Submission Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <p>{formatDate(selectedAbstract.submitted_date)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Reviewed:</span>
                    <p>{formatDate(selectedAbstract.review_date)}</p>
                  </div>
                  {selectedAbstract.reviewer && (
                    <div>
                      <span className="font-medium text-gray-600">Reviewer:</span>
                      <p>{selectedAbstract.reviewer}</p>
                    </div>
                  )}
                  {selectedAbstract.file_name && (
                    <div>
                      <span className="font-medium text-gray-600">File:</span>
                      <p>{selectedAbstract.file_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {selectedAbstract.feedback && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Reviewer Feedback</h4>
                  <p className="text-sm text-blue-800">{selectedAbstract.feedback}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAbstract?.file_name && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
