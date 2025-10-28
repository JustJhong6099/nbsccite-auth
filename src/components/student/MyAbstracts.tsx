import React, { useState, useRef, useEffect } from 'react';
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
  Info,
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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

interface AbstractData {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  research_area?: string;
  methodology?: string;
  year: string;
  department?: string;
  category?: string;
  status: string;
  submitted_date: string | null;
  review_date?: string | null;
  reviewer?: string | null;
  file_name?: string | null;
  feedback?: string | null;
  entity_extraction?: {
    technologies?: string[];
    domains?: string[];
    methodologies?: string[];
    confidence?: number;
  };
}

export const MyAbstracts: React.FC = () => {
  const { user } = useAuth();
  const [abstracts, setAbstracts] = useState<AbstractData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAbstract, setSelectedAbstract] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch abstracts from database
  useEffect(() => {
    if (user) {
      fetchAbstracts();
    }
  }, [user]);

  const fetchAbstracts = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('abstracts')
        .select('*')
        .eq('student_id', user?.id)
        .order('submitted_date', { ascending: false });

      if (error) throw error;

      // Transform data to match interface
      const transformedAbstracts: AbstractData[] = (data || []).map(abstract => ({
        id: abstract.id,
        title: abstract.title,
        abstract: abstract.abstract_text,
        authors: abstract.authors || [],
        keywords: abstract.keywords || [],
        year: abstract.year?.toString() || '2025',
        department: abstract.department,
        category: abstract.category,
        status: abstract.status,
        submitted_date: abstract.submitted_date,
        review_date: abstract.reviewed_date,
        feedback: null, // Will need to add feedback column to schema if needed
        entity_extraction: abstract.extracted_entities ? {
          technologies: abstract.extracted_entities.technologies || [],
          domains: abstract.extracted_entities.domains || [],
          methodologies: abstract.extracted_entities.methodologies || [],
          confidence: abstract.extracted_entities.confidence || abstract.entity_extraction_confidence
        } : undefined
      }));

      setAbstracts(transformedAbstracts);
    } catch (error: any) {
      console.error('Error fetching abstracts:', error);
      toast.error('Failed to load abstracts');
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredAbstracts = abstracts.filter(abstract => {
    const matchesSearch = abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abstract.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || abstract.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const abstractsByStatus = {
    all: abstracts,
    approved: abstracts.filter(a => a.status === 'approved'),
    pending: abstracts.filter(a => a.status === 'pending'),
    rejected: abstracts.filter(a => a.status === 'rejected'),
    needs_revision: abstracts.filter(a => a.status === 'needs-revision')
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
        <Button onClick={fetchAbstracts} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Loading your abstracts...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="text-2xl font-bold text-orange-600">{abstractsByStatus.pending.length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{abstractsByStatus.rejected.length}</div>
                <div className="text-sm text-gray-600">Rejected</div>
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
                  <TabsTrigger value="pending">Pending ({abstractsByStatus.pending.length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({abstractsByStatus.rejected.length})</TabsTrigger>
                  <TabsTrigger value="needs-revision">Needs Revision ({abstractsByStatus.needs_revision.length})</TabsTrigger>
                </TabsList>

                <div className="space-y-4">{filteredAbstracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedStatus === 'all' ? 'No Abstracts Yet' : `No ${selectedStatus.replace('_', ' ')} Abstracts`}
                      </h3>
                      <p className="text-gray-500 max-w-sm">
                        {selectedStatus === 'all' 
                          ? 'Start by submitting your first research abstract.' 
                          : `You don't have any ${selectedStatus.replace('_', ' ')} abstracts.`}
                      </p>
                    </div>
                  ) : (
                    filteredAbstracts.map((abstract) => (
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
              )))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
        </>
      )}

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
