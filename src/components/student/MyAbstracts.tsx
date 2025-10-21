import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import * as d3 from 'd3';
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
  AlertTriangle,
  User,
  Tag,
  Network,
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Type definitions
interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'center' | 'entity';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

// Mock data for student's abstracts
const mockAbstracts = [
  {
    id: '1',
    title: 'Machine Learning Applications in Educational Technology',
    abstract: 'This research explores the implementation of machine learning algorithms in educational platforms to enhance student learning outcomes. The study focuses on personalized learning paths, automated assessment systems, and predictive analytics for student performance.',
    authors: ['You', 'Dr. Sarah Johnson', 'Prof. Michael Chen'],
    keywords: ['Machine Learning', 'Education Technology', 'Personalized Learning', 'Assessment Systems', 'Predictive Analytics'],
    research_area: 'Machine Learning',
    methodology: 'Mixed Methods',
    year: '2024',
    department: 'Institute for Computer Studies',
    category: 'Applied Research',
    status: 'approved',
    submitted_date: '2024-01-15',
    review_date: '2024-01-18',
    reviewer: 'Dr. Sarah Johnson',
    file_name: 'ml_education_paper.pdf',
    feedback: 'Excellent research methodology and clear presentation of findings.',
    entity_extraction: {
      technologies: ['Python', 'TensorFlow', 'Scikit-learn', 'Jupyter', 'Keras'],
      domains: ['Machine Learning', 'Educational Technology', 'Data Science'],
      confidence: 0.92
    }
  },
  {
    id: '2',
    title: 'Web Development Framework for E-commerce Applications',
    abstract: 'This project focuses on developing a comprehensive e-commerce platform using modern web technologies. The frontend is built with React.js, providing a responsive and user-friendly interface.',
    authors: ['You', 'Jane Smith'],
    keywords: ['React', 'Node.js', 'E-commerce', 'Web Development', 'JavaScript', 'MongoDB'],
    research_area: 'Web Development',
    methodology: 'Case Study',
    year: '2024',
    department: 'Institute for Computer Studies',
    category: 'Capstone Project',
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
    authors: ['You', 'Dr. Amanda Liu'],
    keywords: ['Database', 'PostgreSQL', 'Optimization', 'Performance', 'SQL', 'Indexing'],
    research_area: 'Database Systems',
    methodology: 'Experimental Design',
    year: '2023',
    department: 'Institute for Computer Studies',
    category: 'Thesis',
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
    authors: ['You'],
    keywords: ['Flutter', 'Mobile Development', 'Healthcare', 'Dart', 'Firebase', 'Cross-platform'],
    research_area: 'Mobile Development',
    methodology: 'Quantitative Research',
    year: '2024',
    department: 'Institute for Computer Studies',
    category: 'Applied Research',
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
  const svgRef = useRef<SVGSVGElement>(null);

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

  const createEntityVisualization = (abstract: any) => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create container for zoom/pan
    const container = svg.append("g");

    // Filter and rank keywords by IT relevance, removing duplicates
    const seenKeywords = new Set<string>();
    const uniqueKeywords = abstract.keywords
      .filter((keyword: string) => {
        const normalizedKeyword = keyword.toLowerCase().trim();
        if (seenKeywords.has(normalizedKeyword)) {
          return false;
        }
        seenKeywords.add(normalizedKeyword);
        return true;
      });

    // Show top 10 or all if less than 12
    const displayKeywords = uniqueKeywords.length < 12 
      ? uniqueKeywords 
      : uniqueKeywords.slice(0, 10);

    // Create nodes: 1 center node + entity nodes from keywords
    const nodes: Node[] = [
      { id: 'center', label: abstract.title.substring(0, 20) + '...', type: 'center', x: width / 2, y: height / 2 }
    ];

    displayKeywords.forEach((keyword: string, index: number) => {
      nodes.push({
        id: `entity-${index}`,
        label: keyword,
        type: 'entity'
      });
    });

    // Create links from center to all entities
    const links: Link[] = displayKeywords.map((_: string, index: number) => ({
      source: 'center',
      target: `entity-${index}`
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Create links
    const link = container.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Create node groups
    const nodeGroup = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer");

    // Add circles to nodes
    nodeGroup.append("circle")
      .attr("r", (d) => d.type === 'center' ? 40 : 25)
      .attr("fill", (d) => d.type === 'center' ? "#3b82f6" : "#fb923c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add labels
    nodeGroup.append("text")
      .text((d) => d.label.length > 12 ? d.label.substring(0, 12) + '...' : d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.type === 'center' ? 50 : 35)
      .attr("font-size", (d) => d.type === 'center' ? "11px" : "10px")
      .attr("font-weight", (d) => d.type === 'center' ? "600" : "500")
      .attr("fill", "#374151");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  };

  // Create visualization when dialog opens
  React.useEffect(() => {
    if (isViewDialogOpen && selectedAbstract && svgRef.current) {
      const timer = setTimeout(() => {
        createEntityVisualization(selectedAbstract);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isViewDialogOpen, selectedAbstract]);

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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {selectedAbstract?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedAbstract?.year}
              </Badge>
              {getStatusBadge(selectedAbstract?.status || '')}
              <Badge variant="secondary" className="text-xs">
                {selectedAbstract?.category}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          {selectedAbstract && (
            <div className="space-y-6">
              {/* Authors Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Authors</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedAbstract.authors.join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{selectedAbstract.department}</p>
              </div>

              {/* Abstract Text */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Abstract</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedAbstract.abstract}
                  </p>
                </div>
              </div>

              {/* Keywords Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Keywords</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedAbstract.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interactive Entity Graph */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Network className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Interactive Entity Graph</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Visual representation of research entities and their relationships based on extracted keywords
                </p>
                
                <div className="relative border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                  {/* Instructions Card Overlay */}
                  <Card className="absolute top-6 left-6 w-64 shadow-lg z-10 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-blue-900">How to interact:</p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Hover over nodes for details</li>
                            <li>• Drag nodes to rearrange</li>
                            <li>• Blue: Central abstract</li>
                            <li>• Orange: Entity keywords</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* SVG Visualization */}
                  <svg 
                    ref={svgRef} 
                    className="w-full"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>

              {/* Extracted Entities */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Extracted Entities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Technologies</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedAbstract.entity_extraction.technologies.map((tech: string, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Research Domains</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedAbstract.entity_extraction.domains.map((domain: string, index: number) => (
                        <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Extraction Confidence</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${selectedAbstract.entity_extraction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 min-w-[45px]">
                      {Math.round(selectedAbstract.entity_extraction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Submission Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Submitted</span>
                    <p className="text-gray-900 mt-1">
                      {selectedAbstract.submitted_date ? formatDate(selectedAbstract.submitted_date) : 'Not submitted yet'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reviewed</span>
                    <p className="text-gray-900 mt-1">
                      {selectedAbstract.review_date ? formatDate(selectedAbstract.review_date) : 'Pending review'}
                    </p>
                  </div>
                  {selectedAbstract.reviewer && (
                    <div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reviewer</span>
                      <p className="text-gray-900 mt-1">{selectedAbstract.reviewer}</p>
                    </div>
                  )}
                  {selectedAbstract.file_name && (
                    <div>
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Attached File</span>
                      <p className="text-gray-900 mt-1">{selectedAbstract.file_name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Research Area</span>
                    <p className="text-gray-900 mt-1">{selectedAbstract.research_area}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Methodology</span>
                    <p className="text-gray-900 mt-1">{selectedAbstract.methodology}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              {selectedAbstract.feedback && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-sm text-blue-900">Reviewer Feedback</h4>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{selectedAbstract.feedback}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
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
