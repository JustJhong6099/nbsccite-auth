import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { type ExtractedEntities } from '@/lib/dandelion-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAbstract, setEditedAbstract] = useState<any>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities | null>(null);
  const [tempEntityInput, setTempEntityInput] = useState({ tech: '', domain: '', methodology: '' });
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
        feedback: abstract.review_comments || null,
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
    setEditedAbstract({
      title: abstract.title,
      abstract: abstract.abstract,
      authors: abstract.authors.join(', '),
      keywords: abstract.keywords.join(', ')
    });
    setIsEditMode(false);
    setIsViewDialogOpen(true);
  };

  const handleEditAbstract = () => {
    setIsEditMode(true);
    // Initialize extracted entities from existing data if available
    if (selectedAbstract.entity_extraction) {
      setExtractedEntities({
        technologies: selectedAbstract.entity_extraction.technologies || [],
        domains: selectedAbstract.entity_extraction.domains || [],
        methodologies: selectedAbstract.entity_extraction.methodologies || [],
        confidence: selectedAbstract.entity_extraction.confidence || 0
      });
    } else {
      // Initialize empty entity structure for manual entry
      setExtractedEntities({
        technologies: [],
        domains: [],
        methodologies: [],
        confidence: 0.8
      });
    }
  };

  const handleAddEntity = (type: 'technologies' | 'domains' | 'methodologies') => {
    const inputKey = type === 'technologies' ? 'tech' : type === 'domains' ? 'domain' : 'methodology';
    const value = tempEntityInput[inputKey].trim();
    
    if (!value) return;
    
    if (!extractedEntities) {
      setExtractedEntities({
        technologies: type === 'technologies' ? [value] : [],
        domains: type === 'domains' ? [value] : [],
        methodologies: type === 'methodologies' ? [value] : [],
        confidence: 0.8
      });
    } else {
      setExtractedEntities({
        ...extractedEntities,
        [type]: [...extractedEntities[type], value]
      });
    }
    
    setTempEntityInput({ ...tempEntityInput, [inputKey]: '' });
  };

  const handleRemoveEntity = (type: 'technologies' | 'domains' | 'methodologies', index: number) => {
    if (!extractedEntities) return;
    
    setExtractedEntities({
      ...extractedEntities,
      [type]: extractedEntities[type].filter((_, i) => i !== index)
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedAbstract({
      title: selectedAbstract.title,
      abstract: selectedAbstract.abstract,
      authors: selectedAbstract.authors.join(', '),
      keywords: selectedAbstract.keywords.join(', ')
    });
  };

  const handleResubmit = async () => {
    if (!editedAbstract.title || !editedAbstract.abstract) {
      toast.error('Please fill in title and abstract');
      return;
    }

    setIsResubmitting(true);
    try {
      // Update the abstract in the database
      const { error } = await supabase
        .from('abstracts')
        .update({
          title: editedAbstract.title,
          abstract_text: editedAbstract.abstract,
          authors: editedAbstract.authors.split(',').map((a: string) => a.trim()).filter((a: string) => a),
          keywords: editedAbstract.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k),
          extracted_entities: extractedEntities, // Include updated entities
          entity_extraction_confidence: extractedEntities?.confidence || 0,
          status: 'pending', // Change status back to pending for review
          submitted_date: new Date().toISOString(),
          reviewed_date: null,
          review_comments: null
        })
        .eq('id', selectedAbstract.id);

      if (error) throw error;

      toast.success('Abstract resubmitted successfully!');
      setIsViewDialogOpen(false);
      setIsEditMode(false);
      setExtractedEntities(null);
      fetchAbstracts(); // Refresh the list
    } catch (error: any) {
      console.error('Error resubmitting abstract:', error);
      toast.error('Failed to resubmit abstract');
    } finally {
      setIsResubmitting(false);
    }
  };

  const createEntityVisualization = (abstract: any) => {
    console.log('🔍 [createEntityVisualization] Starting visualization');
    console.log('📊 Abstract data:', abstract);
    console.log('🎯 SVG Ref exists:', !!svgRef.current);
    console.log('📦 Entity extraction data:', abstract.entity_extraction);
    
    if (!svgRef.current) {
      console.error('❌ SVG ref is null - DOM not ready');
      return;
    }
    
    if (!abstract.entity_extraction) {
      console.warn('⚠️ No entity_extraction data available');
      // Show message in SVG
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#9ca3af")
        .attr("font-size", "14px")
        .text("No entity data available for this abstract");
      return;
    }

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    console.log('✅ Cleared previous visualization');

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create container for zoom/pan
    const container = svg.append("g");

    // Collect all entities from extracted data
    const allEntities: string[] = [
      ...(abstract.entity_extraction.technologies || []),
      ...(abstract.entity_extraction.domains || []),
      ...(abstract.entity_extraction.methodologies || [])
    ];
    
    console.log('📋 All entities collected:', allEntities.length, allEntities);

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
    
    console.log('✨ Unique entities:', uniqueEntities.length, uniqueEntities);

    // Show top 15 or all if less
    const displayEntities = uniqueEntities.length < 18 
      ? uniqueEntities 
      : uniqueEntities.slice(0, 15);
      
    console.log('🎨 Display entities (max 15):', displayEntities.length, displayEntities);

    if (displayEntities.length === 0) {
      console.warn('⚠️ No entities to display');
      // Show message if no entities
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .attr("font-size", "14px")
        .text("No entities extracted yet");
      return;
    }

    // Create nodes: 1 center node + entity nodes
    const nodes: Node[] = [
      { id: 'center', label: abstract.title.substring(0, 20) + '...', type: 'center', x: width / 2, y: height / 2 }
    ];

    displayEntities.forEach((entity: string, index: number) => {
      nodes.push({
        id: `entity-${index}`,
        label: entity,
        type: 'entity'
      });
    });
    
    console.log('🔷 Created nodes:', nodes.length);

    // Create links from center to all entities
    const links: Link[] = displayEntities.map((_: string, index: number) => ({
      source: 'center',
      target: `entity-${index}`
    }));
    
    console.log('🔗 Created links:', links.length);

    // Create force simulation with same settings as AbstractsLibrary
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));
      
    console.log('⚡ Force simulation created');

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
      .attr("class", "node")
      .style("cursor", "grab")
      .call(d3.drag<any, Node>()
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

    // Add circles to nodes with enhanced hover effects matching AbstractsLibrary
    nodeGroup.append("circle")
      .attr("r", (d) => d.type === 'center' ? 45 : 30)
      .attr("fill", (d) => d.type === 'center' ? "#3b82f6" : "#fb923c")
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

    // Add labels below nodes
    nodeGroup.append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.type === 'center' ? 60 : 45)
      .attr("font-size", (d) => d.type === 'center' ? "13px" : "11px")
      .attr("font-weight", (d) => d.type === 'center' ? "600" : "500")
      .attr("fill", "#374151")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
    
    console.log('✅ [createEntityVisualization] Visualization complete!');
  };

  // Create visualization when dialog opens
  React.useEffect(() => {
    console.log('🎬 [useEffect] Dialog state changed');
    console.log('  - isViewDialogOpen:', isViewDialogOpen);
    console.log('  - selectedAbstract:', selectedAbstract?.title);
    console.log('  - svgRef.current:', !!svgRef.current);
    
    if (isViewDialogOpen && selectedAbstract) {
      console.log('⏱️ Starting 150ms timer for visualization...');
      const timer = setTimeout(() => {
        console.log('⏰ Timer fired, checking svgRef...');
        if (svgRef.current) {
          console.log('✅ SVG ref available, creating visualization');
          try {
            createEntityVisualization(selectedAbstract);
          } catch (error) {
            console.error('❌ Error creating visualization:', error);
          }
        } else {
          console.error('❌ SVG ref still not available after timeout!');
        }
      }, 150); // Match AbstractsLibrary delay
      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
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
              {/* Show edit notice for rejected abstracts in edit mode */}
              {isEditMode && selectedAbstract.status === 'rejected' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900 mb-1">Editing Mode</h4>
                      <p className="text-sm text-blue-800">
                        Make your changes below and click "Resubmit" to send the revised abstract for review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title - Editable if in edit mode */}
              {isEditMode ? (
                <div>
                  <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-900 mb-2">Title</Label>
                  <Input
                    id="edit-title"
                    value={editedAbstract.title}
                    onChange={(e) => setEditedAbstract({ ...editedAbstract, title: e.target.value })}
                    className="mt-2"
                  />
                </div>
              ) : null}

              {/* Authors Section - Editable if in edit mode */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Authors</h4>
                </div>
                {isEditMode ? (
                  <Input
                    value={editedAbstract.authors}
                    onChange={(e) => setEditedAbstract({ ...editedAbstract, authors: e.target.value })}
                    placeholder="Separate authors with commas"
                  />
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      {selectedAbstract.authors.join(', ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{selectedAbstract.department}</p>
                  </>
                )}
              </div>

              {/* Abstract Text - Editable if in edit mode */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Abstract</h4>
                {isEditMode ? (
                  <Textarea
                    value={editedAbstract.abstract}
                    onChange={(e) => setEditedAbstract({ ...editedAbstract, abstract: e.target.value })}
                    rows={8}
                    className="w-full"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {selectedAbstract.abstract}
                    </p>
                  </div>
                )}
              </div>

              {/* Keywords Section - Editable if in edit mode */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-900">Keywords</h4>
                </div>
                {isEditMode ? (
                  <Input
                    value={editedAbstract.keywords}
                    onChange={(e) => setEditedAbstract({ ...editedAbstract, keywords: e.target.value })}
                    placeholder="Separate keywords with commas"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedAbstract.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Entity Extraction Section - Only in Edit Mode */}
              {isEditMode && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Extracted Entities</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Manually classify and manage research entities
                    </p>
                  </div>

                  {extractedEntities && (
                    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {Math.round(extractedEntities.confidence * 100)}% Confidence
                        </Badge>
                        <p className="text-xs text-gray-600">
                          {extractedEntities.technologies.length + extractedEntities.domains.length + extractedEntities.methodologies.length} entities detected
                        </p>
                      </div>

                      {/* Technologies */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                          Technologies
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {extractedEntities.technologies.map((tech, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                              {tech}
                              <button
                                onClick={() => handleRemoveEntity('technologies', idx)}
                                className="ml-1 hover:text-red-600"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add technology..."
                            value={tempEntityInput.tech}
                            onChange={(e) => setTempEntityInput({ ...tempEntityInput, tech: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntity('technologies'))}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddEntity('technologies')}
                            disabled={!tempEntityInput.tech.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Research Domains */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                          Research Domains
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {extractedEntities.domains.map((domain, idx) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700">
                              {domain}
                              <button
                                onClick={() => handleRemoveEntity('domains', idx)}
                                className="ml-1 hover:text-red-600"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add research domain..."
                            value={tempEntityInput.domain}
                            onChange={(e) => setTempEntityInput({ ...tempEntityInput, domain: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntity('domains'))}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddEntity('domains')}
                            disabled={!tempEntityInput.domain.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* Methodologies */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full bg-green-500"></span>
                          Methodologies
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {extractedEntities.methodologies.map((method, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                              {method}
                              <button
                                onClick={() => handleRemoveEntity('methodologies', idx)}
                                className="ml-1 hover:text-red-600"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add methodology..."
                            value={tempEntityInput.methodology}
                            onChange={(e) => setTempEntityInput({ ...tempEntityInput, methodology: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntity('methodologies'))}
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddEntity('methodologies')}
                            disabled={!tempEntityInput.methodology.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Show entity graph and metadata only when not in edit mode */}
              {!isEditMode && (
                <>
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
              {selectedAbstract.entity_extraction && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Extracted Entities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAbstract.entity_extraction.technologies && selectedAbstract.entity_extraction.technologies.length > 0 && (
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
                    )}
                    {selectedAbstract.entity_extraction.domains && selectedAbstract.entity_extraction.domains.length > 0 && (
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
                    )}
                  </div>
                  {selectedAbstract.entity_extraction.methodologies && selectedAbstract.entity_extraction.methodologies.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Methodologies</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedAbstract.entity_extraction.methodologies.map((method: string, index: number) => (
                          <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedAbstract.entity_extraction.confidence && (
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
                  )}
                </div>
              )}

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
                <div className={`border p-4 rounded-lg ${
                  selectedAbstract.status === 'approved' 
                    ? 'bg-green-50 border-green-200' 
                    : selectedAbstract.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2 mb-2">
                    {selectedAbstract.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : selectedAbstract.status === 'rejected' ? (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm mb-1 ${
                        selectedAbstract.status === 'approved' 
                          ? 'text-green-900' 
                          : selectedAbstract.status === 'rejected'
                          ? 'text-red-900'
                          : 'text-yellow-900'
                      }`}>
                        Faculty Feedback
                        {selectedAbstract.status === 'approved' && ' - Approved'}
                        {selectedAbstract.status === 'rejected' && ' - Rejected'}
                        {(selectedAbstract.status === 'reviewed' || selectedAbstract.status === 'needs-revision') && ' - Needs Revision'}
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                        selectedAbstract.status === 'approved' 
                          ? 'text-green-800' 
                          : selectedAbstract.status === 'rejected'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {selectedAbstract.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleResubmit}
                  disabled={isResubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isResubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Resubmitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resubmit for Review
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditMode(false);
                }}>
                  Close
                </Button>
                {selectedAbstract?.status === 'rejected' && (
                  <Button 
                    onClick={handleEditAbstract}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit & Resubmit
                  </Button>
                )}
                {selectedAbstract?.file_name && (
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
