import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import * as d3 from "d3";
import { logAbstractDeletion } from "@/lib/activity-logger";
import { FacultyAbstractSubmission } from "@/components/faculty/FacultyAbstractSubmission";
import jsPDF from 'jspdf';
import { 
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  User,
  Tag,
  Eye,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Plus,
  X,
  Save,
  XCircle,
  Download
} from "lucide-react";

interface AbstractDetail {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  keywords: string[];
  submittedBy: string;
  department: string;
  category: string;
  extractedEntities?: {
    technologies: string[];
    domains: string[];
    methodologies: string[];
  };
  extractionConfidence?: number;
  studentName?: string;
  studentEmail?: string;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'center' | 'entity';
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface AbstractsLibraryProps {
  isFacultyMode?: boolean;
}

export const AbstractsLibrary: React.FC<AbstractsLibraryProps> = ({ isFacultyMode = false }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [abstracts, setAbstracts] = useState<AbstractDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("year-desc");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedAbstract, setSelectedAbstract] = useState<AbstractDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<AbstractDetail | null>(null);
  const [isAddAbstractOpen, setIsAddAbstractOpen] = useState(false);
  const [isEditingEntities, setIsEditingEntities] = useState(false);
  const [editedEntities, setEditedEntities] = useState<{
    technologies: string[];
    domains: string[];
    methodologies: string[];
  } | null>(null);
  const [newEntityInput, setNewEntityInput] = useState('');
  const [newEntityType, setNewEntityType] = useState<'technologies' | 'domains' | 'methodologies'>('technologies');
  const svgRef = useRef<SVGSVGElement>(null);

  // Interactive visualization controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Fetch approved abstracts from database
  useEffect(() => {
    fetchApprovedAbstracts();
  }, []);

  const fetchApprovedAbstracts = async () => {
    try {
      setIsLoading(true);

      // Fetch approved abstracts
      const { data: abstractsData, error: abstractsError } = await supabase
        .from('abstracts')
        .select('*')
        .eq('status', 'approved')
        .order('submitted_date', { ascending: false });

      if (abstractsError) throw abstractsError;

      // Fetch profiles for all student_ids
      const studentIds = abstractsData?.map(a => a.student_id).filter(Boolean) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', studentIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by id for quick lookup
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p]) || []
      );

      // Transform data to AbstractDetail format
      const transformedAbstracts: AbstractDetail[] = (abstractsData || []).map(abstract => {
        const profile = profilesMap.get(abstract.student_id);
        
        return {
          id: abstract.id,
          title: abstract.title,
          abstract: abstract.abstract_text,
          authors: abstract.authors || [],
          year: abstract.year || new Date().getFullYear(),
          keywords: abstract.keywords || [],
          submittedBy: profile?.role === 'faculty' ? 'Faculty' : 'Student',
          department: abstract.department || 'Institute for Computer Studies',
          category: abstract.category || 'Research',
          extractedEntities: abstract.extracted_entities,
          extractionConfidence: abstract.entity_extraction_confidence,
          studentName: profile?.full_name || 'Unknown',
          studentEmail: profile?.email || ''
        };
      });

      setAbstracts(transformedAbstracts);
      console.log('Fetched approved abstracts:', transformedAbstracts.length);
    } catch (error: any) {
      console.error('Error fetching approved abstracts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load abstracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique years for filter
  const availableYears = Array.from(new Set(abstracts.map(a => a.year))).sort((a, b) => b - a);

  // Filter abstracts based on search and filters
  const filteredAbstracts = abstracts
    .filter(abstract => {
      const matchesSearch = searchTerm === "" || 
        abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        abstract.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        abstract.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        abstract.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesYear = filterYear === "all" || abstract.year.toString() === filterYear;
      
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleViewDetails = (abstract: AbstractDetail) => {
    setSelectedAbstract(abstract);
    setIsDetailOpen(true);
    setIsEditingEntities(false);
    setEditedEntities(null);
  };

  const handleEdit = (abstract: AbstractDetail) => {
    setEditFormData({ ...abstract });
    setSelectedAbstract(abstract);
    setIsEditOpen(true);
  };

  const handleDelete = (abstract: AbstractDetail) => {
    setSelectedAbstract(abstract);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    try {
      const { error } = await supabase
        .from('abstracts')
        .update({
          title: editFormData.title,
          authors: editFormData.authors,
          abstract_text: editFormData.abstract,
          year: editFormData.year,
          keywords: editFormData.keywords,
          department: editFormData.department,
          category: editFormData.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', editFormData.id);

      if (error) throw error;

      toast({
        title: "Abstract Updated",
        description: `"${editFormData.title}" has been successfully updated.`,
      });

      setIsEditOpen(false);
      setEditFormData(null);
      
      // If detail modal is open, update it
      if (isDetailOpen && selectedAbstract?.id === editFormData.id) {
        setSelectedAbstract(editFormData);
      }

      // Refresh data
      await fetchApprovedAbstracts();
    } catch (error: any) {
      console.error('Error updating abstract:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update abstract. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAbstract || !user) return;

    try {
      const { error } = await supabase
        .from('abstracts')
        .delete()
        .eq('id', selectedAbstract.id);

      if (error) throw error;

      // Log the deletion activity (only if user is faculty)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role === 'faculty') {
        await logAbstractDeletion(selectedAbstract.id, selectedAbstract.title, 'approved');
      }

      toast({
        title: "Abstract Deleted",
        description: `"${selectedAbstract.title}" has been removed from the library.`,
      });

      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      setSelectedAbstract(null);

      // Refresh data
      await fetchApprovedAbstracts();
    } catch (error: any) {
      console.error('Error deleting abstract:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete abstract. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Entity editing functions
  const handleStartEditingEntities = () => {
    if (selectedAbstract?.extractedEntities) {
      setEditedEntities({
        technologies: [...(selectedAbstract.extractedEntities.technologies || [])],
        domains: [...(selectedAbstract.extractedEntities.domains || [])],
        methodologies: [...(selectedAbstract.extractedEntities.methodologies || [])]
      });
      setIsEditingEntities(true);
    }
  };

  const handleCancelEditingEntities = () => {
    setIsEditingEntities(false);
    setEditedEntities(null);
    setNewEntityInput('');
    setNewEntityType('technologies');
  };

  const handleAddEntity = () => {
    if (!newEntityInput.trim() || !editedEntities) return;

    const newEntity = newEntityInput.trim();
    
    // Check if entity already exists in any category
    const allEntities = [
      ...editedEntities.technologies,
      ...editedEntities.domains,
      ...editedEntities.methodologies
    ];
    
    if (allEntities.includes(newEntity)) {
      toast({
        title: "Duplicate Entity",
        description: "This entity already exists.",
        variant: "destructive",
      });
      return;
    }

    setEditedEntities({
      ...editedEntities,
      [newEntityType]: [...editedEntities[newEntityType], newEntity]
    });
    setNewEntityInput('');
    
    toast({
      title: "Entity Added",
      description: `Added "${newEntity}" to ${newEntityType}.`,
    });
  };

  const handleRemoveEntity = (type: 'technologies' | 'domains' | 'methodologies', entity: string) => {
    if (!editedEntities) return;

    setEditedEntities({
      ...editedEntities,
      [type]: editedEntities[type].filter(e => e !== entity)
    });

    toast({
      title: "Entity Removed",
      description: `Removed "${entity}" from ${type}.`,
    });
  };

  const handleSaveEntities = async () => {
    if (!selectedAbstract || !editedEntities) return;

    try {
      const { error } = await supabase
        .from('abstracts')
        .update({
          extracted_entities: editedEntities,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAbstract.id);

      if (error) throw error;

      toast({
        title: "Entities Updated",
        description: "Entity extraction has been successfully updated.",
      });

      // Update local state
      setSelectedAbstract({
        ...selectedAbstract,
        extractedEntities: editedEntities
      });

      setIsEditingEntities(false);
      setEditedEntities(null);

      // Refresh data
      await fetchApprovedAbstracts();
      
      // Rebuild visualization with new entities
      setTimeout(() => {
        if (svgRef.current && selectedAbstract) {
          createEntityVisualization({
            ...selectedAbstract,
            extractedEntities: editedEntities
          });
        }
      }, 100);
    } catch (error: any) {
      console.error('Error updating entities:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update entities. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export to PDF with visualization
  const handleExportToPDF = async () => {
    if (!selectedAbstract) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your document...",
      });

      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'justify' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string, index: number) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Apply justified alignment for multi-line text (except last line)
          if (align === 'justify' && lines.length > 1 && index < lines.length - 1) {
            pdf.text(line, margin, yPosition, { align: 'justify', maxWidth: maxWidth });
          } else {
            pdf.text(line, margin, yPosition);
          }
          
          yPosition += fontSize * 0.5;
        });
        yPosition += 3;
      };

      // Title
      addText(selectedAbstract.title, 16, true);
      yPosition += 2;

      // Year and Submitted By
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Year: ${selectedAbstract.year}`, margin, yPosition);
      pdf.text(`Submitted By: ${selectedAbstract.submittedBy}`, margin + 40, yPosition);
      yPosition += 8;

      // Authors
      addText('Authors:', 12, true);
      addText(selectedAbstract.authors.join(', '), 10);
      yPosition += 3;

      // Abstract
      addText('Abstract:', 12, true);
      addText(selectedAbstract.abstract, 10, false, 'justify');
      yPosition += 3;

      // Keywords
      addText('Keywords:', 12, true);
      addText(selectedAbstract.keywords.join(', '), 10);
      yPosition += 5;

      // Extracted Entities
      if (selectedAbstract.extractedEntities) {
        addText('Extracted Entities:', 12, true);
        
        const { technologies, domains, methodologies } = selectedAbstract.extractedEntities;

        if (technologies && technologies.length > 0) {
          addText('Technologies:', 11, true);
          addText(technologies.join(', '), 10);
        }

        if (domains && domains.length > 0) {
          addText('Research Domains:', 11, true);
          addText(domains.join(', '), 10);
        }

        if (methodologies && methodologies.length > 0) {
          addText('Methodologies:', 11, true);
          addText(methodologies.join(', '), 10);
        }

        yPosition += 5;
      }

      // Export D3.js visualization as SVG and add to PDF
      if (svgRef.current) {
        addText('Entity Graph Visualization:', 12, true);
        yPosition += 3;

        // Get the SVG element
        const svgElement = svgRef.current;
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        // Create a canvas to render the SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Set canvas dimensions
        canvas.width = 700;
        canvas.height = 400;

        // Create blob from SVG
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (ctx) {
              // Fill white background
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              // Draw SVG
              ctx.drawImage(img, 0, 0);
            }
            
            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/png');
            
            // Check if we need a new page
            if (yPosition + 100 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }

            // Calculate image dimensions to fit page
            const imgWidth = maxWidth;
            const imgHeight = (400 / 700) * imgWidth;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }

      // Save the PDF
      const fileName = `${selectedAbstract.title.replace(/[^a-z0-9]/gi, '_')}_abstract.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Generated",
        description: `"${selectedAbstract.title}" has been exported successfully.`,
      });
    } catch (error: any) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Interactive control functions
  const handleZoomIn = () => {
    if (zoomBehaviorRef.current && svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (zoomBehaviorRef.current && svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetView = () => {
    if (zoomBehaviorRef.current && svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
      setZoomLevel(1);
    }
  };

  const handleToggleSimulation = () => {
    if (simulationRef.current) {
      if (isSimulationRunning) {
        simulationRef.current.stop();
        setIsSimulationRunning(false);
      } else {
        simulationRef.current.alpha(0.3).restart();
        setIsSimulationRunning(true);
      }
    }
  };

  const handleFitToScreen = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const bounds = (svg.node() as SVGSVGElement).getBBox();
      const parent = (svg.node() as SVGSVGElement).parentElement;
      
      if (parent) {
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        
        if (width === 0 || height === 0) return;
        
        const scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
        
        const transform = d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale);
        
        if (zoomBehaviorRef.current) {
          svg.transition()
            .duration(750)
            .call(zoomBehaviorRef.current.transform, transform);
        }
      }
    }
  };

  const createEntityVisualization = (abstract: AbstractDetail) => {
    if (!svgRef.current) return;

    console.log('Creating visualization for:', abstract.title);

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 700;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Add a container group for all elements
    const container = svg.append("g");

    // Use extracted entities instead of keywords
    const extractedEntities = abstract.extractedEntities;
    
    if (!extractedEntities) {
      console.warn('No extracted entities available for visualization');
      return;
    }

    // Collect all entities from extracted data
    const allEntities: string[] = [
      ...(extractedEntities.technologies || []),
      ...(extractedEntities.domains || []),
      ...(extractedEntities.methodologies || [])
    ];

    // Remove duplicates (case-insensitive)
    const seenEntities = new Set<string>();
    const uniqueEntities = allEntities.filter(entity => {
      const normalized = entity.toLowerCase().trim();
      if (seenEntities.has(normalized)) {
        return false;
      }
      seenEntities.add(normalized);
      return true;
    });

    console.log(`Displaying ${uniqueEntities.length} extracted entities in visualization`);

    // Create nodes: 1 center node + entity nodes
    const nodes: Node[] = [
      { id: 'center', label: 'Abstract Center', type: 'center', x: width / 2, y: height / 2 }
    ];

    uniqueEntities.forEach((entity, index) => {
      nodes.push({
        id: `entity-${index}`,
        label: entity,
        type: 'entity'
      });
    });

    // Create links from center to entities
    const links: Link[] = uniqueEntities.map((_, index) => ({
      source: 'center',
      target: `entity-${index}`
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    // Create node groups
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "grab")
      .call(d3.drag<SVGGElement, Node>()
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
        }) as any);

    // Add circles to nodes with hover effects
    node.append("circle")
      .attr("r", (d) => d.type === 'center' ? 45 : 30)
      .attr("fill", (d) => d.type === 'center' ? "#3b82f6" : "#fb923c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .on("mouseover", function(event, d) {
        // Highlight node
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
        // Reset node
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
    node.append("text")
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

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Store simulation reference
    simulationRef.current = simulation;

    console.log('Visualization created with', nodes.length, 'nodes');
  };

  // Create entity visualization when abstract is selected
  useEffect(() => {
    if (selectedAbstract && isDetailOpen) {
      console.log('useEffect triggered - Modal open:', isDetailOpen, 'SVG ref:', !!svgRef.current);
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (svgRef.current) {
          console.log('Creating visualization...');
          createEntityVisualization(selectedAbstract);
        } else {
          console.error('SVG ref not available');
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [selectedAbstract, isDetailOpen]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Approved Abstracts Library
              </CardTitle>
              <CardDescription>
                Browse all approved research abstracts from faculty and students
              </CardDescription>
            </div>
            {isFacultyMode && (
              <Button onClick={() => setIsAddAbstractOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Abstract
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, authors, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year-desc">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="year-asc">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="title">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Title (A-Z)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAbstracts.length} of {abstracts.length} abstracts
            </span>
            <div className="flex items-center gap-2">
              {(searchTerm || filterYear !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterYear("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchApprovedAbstracts}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading approved abstracts...</p>
            </div>
          ) : (
            <>
              {/* Abstracts Grid */}
              <div className="grid grid-cols-1 gap-4">
            {filteredAbstracts.map((abstract) => (
              <Card key={abstract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {/* Title and Year */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {abstract.title}
                      </h3>
                      <Badge variant="outline" className="shrink-0">
                        {abstract.year}
                      </Badge>
                    </div>

                    {/* Abstract Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {abstract.abstract}
                    </p>

                    {/* Authors */}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Authors:</span>
                      <span>{abstract.authors.join(", ")}</span>
                    </div>

                    {/* Keywords */}
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2">
                          {abstract.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Extracted Entities */}
                    {abstract.extractedEntities && (
                      <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                        <Network className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-600 block mb-2">Extracted Entities:</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              ...(abstract.extractedEntities.technologies || []).slice(0, 3),
                              ...(abstract.extractedEntities.domains || []).slice(0, 2)
                            ].map((entity, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                                {entity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {abstract.submittedBy}
                          </Badge>
                        </span>
                        <span>{abstract.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(abstract)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {isFacultyMode && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(abstract)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(abstract)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredAbstracts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No abstracts found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
          </>
          )}
        </CardContent>
      </Card>

      {/* Abstract Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedAbstract?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-4 pt-2">
              <Badge variant="outline">{selectedAbstract?.year}</Badge>
              <Badge>{selectedAbstract?.submittedBy}</Badge>
              <Badge variant="secondary">{selectedAbstract?.category}</Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedAbstract && (
            <div className="space-y-6 pt-4">
              {/* Authors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Authors
                </h4>
                <p className="text-gray-700">{selectedAbstract.authors.join(", ")}</p>
              </div>

              {/* Abstract */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Abstract</h4>
                <p className="text-gray-700 leading-relaxed text-justify">{selectedAbstract.abstract}</p>
              </div>

              {/* Keywords */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAbstract.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Extracted Entities */}
              {selectedAbstract.extractedEntities && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Extracted Entities
                      {selectedAbstract.extractionConfidence && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                          {Math.round(selectedAbstract.extractionConfidence * 100)}% Confidence
                        </Badge>
                      )}
                    </h4>
                    {isFacultyMode && !isEditingEntities && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEditingEntities}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit Entities
                      </Button>
                    )}
                    {isFacultyMode && isEditingEntities && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEditingEntities}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEntities}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Add Entity Input (Faculty Mode) */}
                  {isFacultyMode && isEditingEntities && editedEntities && (
                    <Card className="mb-4 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <Label className="text-sm font-medium text-gray-900 mb-2 block">Add New Entity</Label>
                        <div className="flex gap-2">
                          <Select value={newEntityType} onValueChange={(value: any) => setNewEntityType(value)}>
                            <SelectTrigger className="w-[180px] bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technologies">Technology</SelectItem>
                              <SelectItem value="domains">Research Domain</SelectItem>
                              <SelectItem value="methodologies">Methodology</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Enter entity name..."
                            value={newEntityInput}
                            onChange={(e) => setNewEntityInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddEntity()}
                            className="flex-1 bg-white"
                          />
                          <Button onClick={handleAddEntity} size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Technologies */}
                    {((isEditingEntities && editedEntities) ? editedEntities.technologies : selectedAbstract.extractedEntities.technologies) && 
                     ((isEditingEntities && editedEntities) ? editedEntities.technologies : selectedAbstract.extractedEntities.technologies).length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                          Technologies
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {((isEditingEntities && editedEntities) ? editedEntities.technologies : selectedAbstract.extractedEntities.technologies).map((tech: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`bg-blue-50 text-blue-700 ${isEditingEntities ? 'pr-1' : ''}`}
                            >
                              {tech}
                              {isEditingEntities && (
                                <button
                                  onClick={() => handleRemoveEntity('technologies', tech)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Research Domains */}
                    {((isEditingEntities && editedEntities) ? editedEntities.domains : selectedAbstract.extractedEntities.domains) && 
                     ((isEditingEntities && editedEntities) ? editedEntities.domains : selectedAbstract.extractedEntities.domains).length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                          Research Domains
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {((isEditingEntities && editedEntities) ? editedEntities.domains : selectedAbstract.extractedEntities.domains).map((domain: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`bg-purple-50 text-purple-700 ${isEditingEntities ? 'pr-1' : ''}`}
                            >
                              {domain}
                              {isEditingEntities && (
                                <button
                                  onClick={() => handleRemoveEntity('domains', domain)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Methodologies - Full Width */}
                  {((isEditingEntities && editedEntities) ? editedEntities.methodologies : selectedAbstract.extractedEntities.methodologies) && 
                   ((isEditingEntities && editedEntities) ? editedEntities.methodologies : selectedAbstract.extractedEntities.methodologies).length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        Methodologies
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {((isEditingEntities && editedEntities) ? editedEntities.methodologies : selectedAbstract.extractedEntities.methodologies).map((method: string, idx: number) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className={`bg-green-50 text-green-700 ${isEditingEntities ? 'pr-1' : ''}`}
                          >
                            {method}
                            {isEditingEntities && (
                              <button
                                onClick={() => handleRemoveEntity('methodologies', method)}
                                className="ml-2 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Entity Visualization */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Interactive Entity Graph
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Explore connections between your research entities. Click on nodes to view details.
                </p>

                {/* Visualization */}
                <div>
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-center items-center min-h-[400px] border-2 border-gray-200 rounded-lg bg-white relative">
                          {/* Instructions Overlay - Top Left */}
                          <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg">
                              <CardContent className="p-3">
                                <ul className="space-y-1 text-xs text-gray-700">
                                  <li className="flex items-center gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><strong>Drag nodes</strong> to rearrange</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><strong>Scroll wheel</strong> to zoom</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><strong>Click & drag</strong> background to pan</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><strong>Hover nodes</strong> to highlight</span>
                                  </li>
                                </ul>
                              </CardContent>
                            </Card>
                          </div>

                          <svg 
                            ref={svgRef} 
                            className="w-full h-full"
                            style={{ minHeight: '400px' }}
                          ></svg>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                            <span className="text-gray-700 font-medium">Abstract Center</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-orange-400 border-2 border-white shadow"></div>
                            <span className="text-gray-700 font-medium">Extracted Entities</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              {/* Export to PDF Section */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleExportToPDF}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF (with Visualization)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Download this abstract with the entity graph visualization
                </p>
              </div>

              {/* Actions */}
              {isFacultyMode && selectedAbstract && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleEdit(selectedAbstract)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleDelete(selectedAbstract)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Abstract Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Abstract</DialogTitle>
            <DialogDescription>
              Update the abstract details below
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-authors">Authors (comma-separated) *</Label>
                <Input
                  id="edit-authors"
                  value={editFormData.authors.join(", ")}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    authors: e.target.value.split(",").map(a => a.trim()) 
                  })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-year">Year *</Label>
                  <Select 
                    value={editFormData.year.toString()} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, year: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input
                    id="edit-category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-abstract">Abstract Text *</Label>
                <Textarea
                  id="edit-abstract"
                  value={editFormData.abstract}
                  onChange={(e) => setEditFormData({ ...editFormData, abstract: e.target.value })}
                  className="mt-1 min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="edit-keywords">Keywords (comma-separated) *</Label>
                <Input
                  id="edit-keywords"
                  value={editFormData.keywords.join(", ")}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    keywords: e.target.value.split(",").map(k => k.trim()) 
                  })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the abstract "{selectedAbstract?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Faculty Abstract Submission Modal */}
      {isFacultyMode && (
        <FacultyAbstractSubmission
          isOpen={isAddAbstractOpen}
          onClose={() => setIsAddAbstractOpen(false)}
          onSuccess={() => {
            fetchApprovedAbstracts();
          }}
        />
      )}
    </div>
  );
};
