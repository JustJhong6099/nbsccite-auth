import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import * as d3 from "d3";
import { 
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  User,
  Tag,
  Eye,
  Download,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

// Mock data for approved abstracts
const mockApprovedAbstracts = [
  {
    id: "1",
    title: "Machine Learning Applications in Precision Agriculture",
    abstract: "This research explores the application of machine learning algorithms in precision agriculture, focusing on crop yield prediction and pest detection. Using datasets from multiple agricultural regions, we developed a hybrid model combining convolutional neural networks (CNN) and recurrent neural networks (RNN) that achieved 94% accuracy in yield prediction and 89% accuracy in pest identification.",
    authors: ["Dr. Maria Santos", "John Doe", "Jane Smith"],
    year: 2024,
    keywords: ["Machine Learning", "Agriculture", "IoT", "Data Analytics", "Precision Farming"],
    submittedBy: "Faculty",
    department: "Institute for Computer Studies",
    category: "Applied Research"
  },
  {
    id: "2",
    title: "IoT-Based Smart City Infrastructure: A Case Study",
    abstract: "An investigation into IoT implementation for smart city development in urban areas. This study examines the integration of sensor networks, data analytics platforms, and citizen engagement systems. Results demonstrate a 35% improvement in resource allocation and 28% reduction in energy consumption.",
    authors: ["Dr. Robert Chen", "Emily Wang"],
    year: 2024,
    keywords: ["IoT", "Smart Cities", "Infrastructure", "Technology", "Urban Planning"],
    submittedBy: "Faculty",
    department: "Institute for Computer Studies",
    category: "Infrastructure"
  },
  {
    id: "3",
    title: "Blockchain Technology in Supply Chain Management",
    abstract: "This paper presents a blockchain-based framework for enhancing transparency and traceability in supply chain management. The proposed system utilizes smart contracts and distributed ledger technology to automate processes and reduce fraud. Implementation results show a 45% reduction in processing time and improved stakeholder trust.",
    authors: ["Sarah Johnson", "Dr. Mark Lee", "Alex Brown"],
    year: 2023,
    keywords: ["Blockchain", "Supply Chain", "Smart Contracts", "Transparency", "Logistics"],
    submittedBy: "Student",
    department: "Institute for Computer Studies",
    category: "Applied Research"
  },
  {
    id: "4",
    title: "Natural Language Processing for Filipino Language Education",
    abstract: "Development of NLP tools specifically designed for Filipino language learning and assessment. This research introduces a novel approach to grammar checking, sentiment analysis, and automated essay scoring for Filipino texts. The system achieved 87% accuracy in grammar correction and 82% in sentiment classification.",
    authors: ["Dr. Ana Reyes", "Miguel Santos", "Lisa Cruz"],
    year: 2023,
    keywords: ["NLP", "Filipino Language", "Education", "Machine Learning", "Linguistics"],
    submittedBy: "Faculty",
    department: "Institute for Computer Studies",
    category: "Educational Technology"
  },
  {
    id: "5",
    title: "Cybersecurity Threats in Cloud Computing Environments",
    abstract: "A comprehensive analysis of emerging cybersecurity threats in cloud computing environments. This study identifies vulnerabilities in multi-tenant architectures and proposes a layered security framework. The framework was tested across various cloud platforms and demonstrated a 67% improvement in threat detection.",
    authors: ["Kevin Martinez", "Dr. Susan Taylor"],
    year: 2023,
    keywords: ["Cybersecurity", "Cloud Computing", "Threat Detection", "Security Framework", "Data Protection"],
    submittedBy: "Student",
    department: "Institute for Computer Studies",
    category: "Security"
  },
  {
    id: "6",
    title: "Augmented Reality in Medical Education and Training",
    abstract: "This research explores the application of augmented reality (AR) technology in medical education, particularly in anatomy learning and surgical training. The study developed an AR application that allows students to visualize 3D anatomical structures in real-time. Results show a 42% improvement in knowledge retention.",
    authors: ["Dr. Patricia Garcia", "Rachel Kim", "David Nguyen"],
    year: 2022,
    keywords: ["Augmented Reality", "Medical Education", "Training", "3D Visualization", "Healthcare"],
    submittedBy: "Faculty",
    department: "Institute for Computer Studies",
    category: "Healthcare Technology"
  },
  {
    id: "7",
    title: "Predictive Analytics for Student Performance Assessment",
    abstract: "Development of a predictive analytics model to identify at-risk students early in their academic journey. Using historical academic data and machine learning algorithms, the system predicts student performance with 91% accuracy, enabling timely intervention and support.",
    authors: ["Michael Thompson", "Dr. James Wilson"],
    year: 2022,
    keywords: ["Predictive Analytics", "Education", "Machine Learning", "Student Assessment", "Data Mining"],
    submittedBy: "Student",
    department: "Institute for Computer Studies",
    category: "Educational Technology"
  },
  {
    id: "8",
    title: "Renewable Energy Management Systems Using AI",
    abstract: "An AI-powered energy management system designed to optimize renewable energy distribution in smart grids. The system uses deep learning to predict energy demand and supply patterns, resulting in 38% improvement in energy efficiency and 25% reduction in operational costs.",
    authors: ["Dr. Jennifer Lopez", "Carlos Mendez", "Nina Patel"],
    year: 2022,
    keywords: ["Artificial Intelligence", "Renewable Energy", "Smart Grids", "Energy Management", "Sustainability"],
    submittedBy: "Faculty",
    department: "Institute for Computer Studies",
    category: "Energy Systems"
  }
];

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

export const AbstractsLibrary: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("year-desc");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedAbstract, setSelectedAbstract] = useState<AbstractDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Interactive visualization controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Get unique years for filter
  const availableYears = Array.from(new Set(mockApprovedAbstracts.map(a => a.year))).sort((a, b) => b - a);

  // Filter abstracts based on search and filters
  const filteredAbstracts = mockApprovedAbstracts
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
  };

  const handleDownloadPDF = (abstract: AbstractDetail) => {
    try {
      // Create a formatted text document with abstract details
      const content = `
${abstract.title}
${'='.repeat(abstract.title.length)}

Authors: ${abstract.authors.join(", ")}
Year: ${abstract.year}
Department: ${abstract.department}
Category: ${abstract.category}
Submitted By: ${abstract.submittedBy}

ABSTRACT
--------
${abstract.abstract}

KEYWORDS
--------
${abstract.keywords.join(", ")}

EXTRACTED ENTITIES
-----------------
${abstract.keywords.slice(0, 5).join(", ")}

---
Document generated from NBSC CITE Research Repository
${new Date().toLocaleDateString()}
      `.trim();

      // Create a blob from the content
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${abstract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success toast
      toast({
        title: "Download Started",
        description: `"${abstract.title}" is being downloaded.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again.",
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

  // Function to calculate IT relevance score for keywords
  const calculateKeywordITRelevance = (keyword: string): number => {
    const itKeywords = [
      'computer', 'software', 'hardware', 'algorithm', 'data', 'network', 'system',
      'programming', 'code', 'application', 'database', 'technology', 'digital',
      'machine learning', 'ai', 'artificial intelligence', 'cloud', 'security',
      'web', 'mobile', 'api', 'framework', 'development', 'server', 'client',
      'javascript', 'python', 'java', 'react', 'node', 'innovation', 'blockchain',
      'iot', 'analytics', 'platform', 'architecture', 'interface', 'automation',
      'neural', 'deep learning', 'model', 'training', 'dataset', 'prediction',
      'computing', 'processor', 'memory', 'storage', 'virtual', 'encryption',
      'protocol', 'internet', 'connectivity', 'wireless', 'sensor', 'device'
    ];

    const keywordLower = keyword.toLowerCase();
    let score = 0;
    
    // Check if keyword contains IT-related terms
    itKeywords.forEach(itKeyword => {
      if (keywordLower.includes(itKeyword)) score += 2;
    });
    
    // Bonus for exact matches
    if (itKeywords.includes(keywordLower)) score += 3;
    
    return score;
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

    // Filter and rank keywords by IT relevance, removing duplicates
    const seenKeywords = new Set<string>();
    const uniqueKeywords = abstract.keywords
      .map(keyword => ({
        keyword,
        score: calculateKeywordITRelevance(keyword)
      }))
      .sort((a, b) => b.score - a.score)
      .filter(item => {
        // Check for duplicates (case-insensitive)
        const normalizedKeyword = item.keyword.toLowerCase().trim();
        if (seenKeywords.has(normalizedKeyword)) {
          return false; // Skip duplicate
        }
        seenKeywords.add(normalizedKeyword);
        return true;
      });

    // If less than 12 unique keywords, show all; otherwise show top 10 IT-related
    const rankedKeywords = uniqueKeywords.length < 12
      ? uniqueKeywords.map(item => item.keyword)
      : uniqueKeywords.slice(0, 10).map(item => item.keyword);

    console.log(`Filtered ${abstract.keywords.length} keywords down to ${rankedKeywords.length} unique keywords (${uniqueKeywords.length < 12 ? 'showing all' : 'top 10 IT-related'})`);

    // Create nodes: 1 center node + filtered entity nodes
    const nodes: Node[] = [
      { id: 'center', label: 'Abstract Center', type: 'center', x: width / 2, y: height / 2 }
    ];

    rankedKeywords.forEach((keyword, index) => {
      nodes.push({
        id: `entity-${index}`,
        label: keyword,
        type: 'entity'
      });
    });

    // Create links from center to filtered entities
    const links: Link[] = rankedKeywords.map((_, index) => ({
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
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Approved Abstracts Library
          </CardTitle>
          <CardDescription>
            Browse all approved research abstracts from faculty and students
          </CardDescription>
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
              Showing {filteredAbstracts.length} of {mockApprovedAbstracts.length} abstracts
            </span>
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
          </div>

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

                    {/* Extracted Entities (sample subset of keywords) */}
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                      <Network className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-600 block mb-2">Extracted Entities:</span>
                        <div className="flex flex-wrap gap-2">
                          {abstract.keywords.slice(0, 5).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(abstract)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredAbstracts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No abstracts found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
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
                <p className="text-gray-700 leading-relaxed">{selectedAbstract.abstract}</p>
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

              {/* Entity Visualization */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Interactive Entity Graph
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Explore connections between your research entities. Click on nodes to view details.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Interactive Controls */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                        🎮 Interactive Controls
                      </h5>
                      
                      {/* Control Buttons */}
                      <div className="space-y-2 mb-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={handleZoomIn}
                            title="Zoom In"
                          >
                            <ZoomIn className="h-3 w-3 mr-1" />
                            Zoom In
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                          >
                            <ZoomOut className="h-3 w-3 mr-1" />
                            Zoom Out
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs"
                          onClick={handleFitToScreen}
                          title="Fit to Screen"
                        >
                          <Maximize2 className="h-3 w-3 mr-1" />
                          Fit to Screen
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs"
                          onClick={handleToggleSimulation}
                          title={isSimulationRunning ? "Pause Physics" : "Resume Physics"}
                        >
                          {isSimulationRunning ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Pause Physics
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Resume Physics
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-8 text-xs"
                          onClick={handleResetView}
                          title="Reset View"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset View
                        </Button>
                      </div>

                      {/* Zoom Level Indicator */}
                      <div className="mb-3 p-2 bg-white rounded border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Zoom Level</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {(zoomLevel * 100).toFixed(0)}%
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      <div className="border-t border-blue-200 pt-3">
                        <ul className="space-y-2 text-xs text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Drag nodes</strong> to rearrange</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Scroll wheel</strong> to zoom</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Click & drag</strong> background to pan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Hover nodes</strong> to highlight</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visualization */}
                  <div className="lg:col-span-3">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-center items-center min-h-[400px] border-2 border-gray-200 rounded-lg bg-white relative">
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
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Department</h4>
                  <p className="text-gray-700">{selectedAbstract.department}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-700">{selectedAbstract.category}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => selectedAbstract && handleDownloadPDF(selectedAbstract)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
