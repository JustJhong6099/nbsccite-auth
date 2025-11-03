import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  GitBranch, 
  Network,
  Zap,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { normalizeTerm } from '@/lib/data-normalization';
import * as d3 from 'd3';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Abstract {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  year: number;
  extracted_entities: {
    technologies: string[];
    domains: string[];
    methodologies: string[];
  };
}

interface Node {
  id: string;
  label: string;
  type: 'abstract' | 'entity';
  size: number;
  color: string;
  abstractId: string; // Which abstract this node belongs to
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | any;
  target: string | any;
  strength: number;
  type: string;
}

// Pie Chart Component using Chart.js
interface PieChartProps {
  data: Array<{
    category: string;
    count: number;
    percentage: string;
  }>;
}

const PieChartComponent: React.FC<PieChartProps> = ({ data }) => {
  const colors = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#a855f7'
  ];

  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 15,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false, // We have our own legend on the left
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = data[context.dataIndex]?.percentage || '0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      delay: (context: any) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 100; // 100ms delay between each slice
        }
        return delay;
      },
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export const FacultyVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [filteredAbstracts, setFilteredAbstracts] = useState<Abstract[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; links: Link[] }>({ nodes: [], links: [] });
  const [frequencyData, setFrequencyData] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { toast } = useToast();

  // Fetch approved abstracts from Supabase
  useEffect(() => {
    fetchApprovedAbstracts();
    
    // Set up real-time subscription for approved abstracts
    const channel = supabase
      .channel('faculty_visualization_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'abstracts',
          filter: 'status=eq.approved'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh data when approved abstracts change
          fetchApprovedAbstracts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter abstracts by year
  useEffect(() => {
    if (selectedYear === 'all') {
      setFilteredAbstracts(abstracts);
    } else {
      setFilteredAbstracts(abstracts.filter(a => a.year === parseInt(selectedYear)));
    }
  }, [selectedYear, abstracts]);

  // Update graph when filtered abstracts change
  useEffect(() => {
    if (filteredAbstracts.length > 0) {
      processGraphData(filteredAbstracts);
      processFrequencyData(filteredAbstracts);
    } else {
      setGraphData({ nodes: [], links: [] });
      setFrequencyData([]);
    }
  }, [filteredAbstracts]);

  const fetchApprovedAbstracts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('abstracts')
        .select('*')
        .eq('status', 'approved')
        .not('extracted_entities', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAbstracts(data || []);
      
      // Extract unique years for filter
      const years = [...new Set(data?.map(a => a.year).filter(Boolean))].sort((a, b) => b - a);
      setAvailableYears(years as number[]);
      
      // Process data for visualization
      if (data && data.length > 0) {
        setFilteredAbstracts(data);
      }
    } catch (error: any) {
      console.error('Error fetching abstracts:', error);
      toast({
        title: "Error",
        description: "Failed to load abstracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processGraphData = (abstracts: Abstract[]) => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Create abstract nodes and their entity nodes (each abstract is isolated)
    abstracts.forEach((abstract, index) => {
      const abstractId = `abstract_${abstract.id}`;
      
      // Add abstract node
      nodes.push({
        id: abstractId,
        label: '', // Empty label for abstract centers
        type: 'abstract',
        size: 30,
        color: '#3b82f6',
        abstractId: abstractId,
      });

      const entities = abstract.extracted_entities;
      if (!entities) return;

      // Combine all entities from technologies, domains, and methodologies (with normalization)
      const allEntities = [
        ...(entities.technologies || []),
        ...(entities.domains || []),
        ...(entities.methodologies || [])
      ].map(entity => normalizeTerm(entity, true))
        .filter((entity): entity is string => entity !== null);

      // Create entity nodes with UNIQUE IDs per abstract (to prevent merging)
      allEntities.forEach((entity: string, entityIndex: number) => {
        const uniqueEntityId = `entity_${abstract.id}_${entityIndex}`; // Unique per abstract
        
        // Add entity node (unique to this abstract)
        nodes.push({
          id: uniqueEntityId,
          label: entity,
          type: 'entity',
          size: 15,
          color: '#f97316',
          abstractId: abstractId,
        });

        // Create link from abstract to its entity
        links.push({
          source: abstractId,
          target: uniqueEntityId,
          strength: 1.0,
          type: 'contains'
        });
      });
    });

    setGraphData({ nodes, links });
  };

  const processFrequencyData = (abstracts: Abstract[]) => {
    const entityCount = new Map<string, number>();
    const categoryCount = {
      technologies: 0,
      domains: 0,
      methodologies: 0
    };

    abstracts.forEach(abstract => {
      const entities = abstract.extracted_entities;
      if (!entities) return;

      // Count technologies (with normalization)
      (entities.technologies || []).forEach((tech: string) => {
        const normalized = normalizeTerm(tech, true);
        if (normalized) {
          entityCount.set(normalized, (entityCount.get(normalized) || 0) + 1);
          categoryCount.technologies++;
        }
      });

      // Count domains (with normalization)
      (entities.domains || []).forEach((domain: string) => {
        const normalized = normalizeTerm(domain, true);
        if (normalized) {
          entityCount.set(normalized, (entityCount.get(normalized) || 0) + 1);
          categoryCount.domains++;
        }
      });

      // Count methodologies (with normalization)
      (entities.methodologies || []).forEach((method: string) => {
        const normalized = normalizeTerm(method, true);
        if (normalized) {
          entityCount.set(normalized, (entityCount.get(normalized) || 0) + 1);
          categoryCount.methodologies++;
        }
      });
    });

    // Convert to array and sort by count
    const sortedEntities = Array.from(entityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Top 15 entities

    const totalCount = sortedEntities.reduce((sum, [, count]) => sum + count, 0);

    const frequencyData = sortedEntities.map(([entity, count]) => ({
      category: entity,
      count,
      percentage: ((count / totalCount) * 100).toFixed(1),
      trend: 'stable' // You can implement trend calculation based on historical data
    }));

    setFrequencyData(frequencyData);
  };

  // D3.js Force-Directed Graph Implementation
  const renderForceGraph = useCallback(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Group nodes by abstract for initial positioning
    const abstractGroups = new Map<string, Node[]>();
    graphData.nodes.forEach(node => {
      const groupId = node.abstractId;
      if (!abstractGroups.has(groupId)) {
        abstractGroups.set(groupId, []);
      }
      abstractGroups.get(groupId)!.push(node);
    });

    // Calculate initial grid positions for each abstract group (not fixed)
    const numAbstracts = abstractGroups.size;
    const cols = Math.ceil(Math.sqrt(numAbstracts));
    const rows = Math.ceil(numAbstracts / cols);

    let groupIndex = 0;
    abstractGroups.forEach((groupNodes, abstractId) => {
      const col = groupIndex % cols;
      const row = Math.floor(groupIndex / cols);
      const centerX = (col + 0.5) * (width / cols);
      const centerY = (row + 0.5) * (height / rows);
      
      // Set initial positions (not fixed, just starting position)
      groupNodes.forEach(node => {
        if (!node.x) node.x = centerX + (Math.random() - 0.5) * 50;
        if (!node.y) node.y = centerY + (Math.random() - 0.5) * 50;
      });
      
      groupIndex++;
    });

    // Create force simulation with group separation
    const simulation = d3.forceSimulation(graphData.nodes as any)
      .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance(50).strength(0.3))
      .force("charge", d3.forceManyBody().strength((d: any) => d.type === 'abstract' ? -1000 : -100))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.01))
      .force("collision", d3.forceCollide().radius((d: any) => d.type === 'abstract' ? 80 : 30))
      .force("x", d3.forceX(width / 2).strength(0.005))
      .force("y", d3.forceY(height / 2).strength(0.005))
      .velocityDecay(0.7)  // Higher value = slower movement (default is 0.4)
      .alphaDecay(0.01);   // Slower settling (default is 0.0228)

    // Add custom force to keep entities close to their abstract
    simulation.force("grouping", () => {
      graphData.nodes.forEach(node => {
        if (node.type === 'entity') {
          // Find the abstract this entity belongs to
          const abstractNode = graphData.nodes.find(n => n.id === node.abstractId);
          if (abstractNode && abstractNode.x && abstractNode.y && node.x && node.y) {
            const dx = abstractNode.x - node.x;
            const dy = abstractNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Pull entity towards its abstract if too far (very gentle force)
            if (distance > 100) {
              const force = (distance - 100) * 0.02; // Reduced from 0.1 to 0.02
              node.vx = (node.vx || 0) + (dx / distance) * force;
              node.vy = (node.vy || 0) + (dy / distance) * force;
            }
          }
        }
      });
    });

    // Create links (edges)
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5);

    // Create node groups
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graphData.nodes)
      .enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    // Add circles to nodes
    node.append("circle")
      .attr("r", (d: any) => d.size)
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("click", (event, d: any) => {
        // Only allow clicking on abstract nodes
        if (d.type === 'abstract') {
          const abstractId = d.id.replace('abstract_', '');
          const abstractData = filteredAbstracts.find(a => a.id === abstractId);
          
          setSelectedNode({ ...d, abstract: abstractData });
          setIsModalOpen(true);
        }
      })
      .on("mouseover", function(event, d: any) {
        if (d.type === 'abstract') {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", (d: any) => d.size + 3)
            .attr("stroke-width", 3);
          
          // Highlight connected nodes for this abstract only
          const connectedLinks = graphData.links.filter((l: any) => 
            l.source.id === d.id || l.target.id === d.id
          );
          const connectedNodeIds = connectedLinks.map((l: any) => 
            l.source.id === d.id ? l.target.id : l.source.id
          );
          
          node.selectAll("circle")
            .style("opacity", (n: any) => 
              n.abstractId === d.abstractId || connectedNodeIds.includes(n.id) || n.id === d.id ? 1 : 0.2
            );
          
          link.style("opacity", (l: any) => 
            l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.1
          );
        }
      })
      .on("mouseout", function(event, d: any) {
        if (d.type === 'abstract') {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", (d: any) => d.size)
            .attr("stroke-width", 2);
          
          // Reset all nodes and links opacity
          node.selectAll("circle").style("opacity", 1);
          link.style("opacity", 0.6);
        }
      });

    // Add labels beside nodes (not inside)
    node.append("text")
      .text((d: any) => d.label)
      .attr("font-size", 11)
      .attr("font-family", "Arial, sans-serif")
      .attr("text-anchor", "start")
      .attr("dx", (d: any) => d.size + 5)
      .attr("dy", ".35em")
      .attr("fill", "#333")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        svg.select("g.links").attr("transform", event.transform);
        svg.select("g.nodes").attr("transform", event.transform);
      });

    svg.call(zoom as any);

  }, [dimensions, graphData, filteredAbstracts]);

  useEffect(() => {
    renderForceGraph();
  }, [renderForceGraph]);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        // Calculate width for 2/3 of the container in lg screens
        const containerWidth = container.clientWidth;
        const leftPaneWidth = window.innerWidth >= 1024 ? containerWidth * 0.66 : containerWidth;
        setDimensions({
          width: leftPaneWidth - 24, // Account for padding
          height: 600
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Entity Visualization</h2>
          <p className="text-gray-600">Explore relationships between technologies, domains, and research</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="graph" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Force Graph
          </TabsTrigger>
          <TabsTrigger value="frequency" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Frequency Chart
          </TabsTrigger>
        </TabsList>

        {/* Force-Directed Graph Tab */}
        <TabsContent value="graph" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600">Loading entity visualization...</p>
                </div>
              </CardContent>
            </Card>
          ) : graphData.nodes.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Network className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">No approved abstracts with entities found.</p>
                  <p className="text-sm text-gray-500">Submit and approve abstracts to see the entity visualization.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Interactive Entity Graph</CardTitle>
                  <CardDescription>Explore connections between your research entities. Click on nodes to view details.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left pane - Visualization (2/3 width) */}
                <div className="lg:col-span-2">
                  <div className="relative w-full bg-white rounded-lg border overflow-hidden">
                    <svg 
                      ref={svgRef} 
                      width={dimensions.width} 
                      height={dimensions.height}
                      className="w-full h-full"
                    >
                    </svg>
                    {/* Instructions overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm border max-w-xs">
                      <h4 className="text-sm font-medium mb-2">Interactive Controls:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Click abstract centers (blue) to view details</li>
                        <li>• Drag any node to rearrange position</li>
                        <li>• Scroll to zoom in/out</li>
                        <li>• Hover abstracts to highlight connections</li>
                        <li>• Each abstract group stays together (no merging)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right pane - Legend and Statistics (1/3 width) */}
                <div className="space-y-4">
                  {/* Year Filter */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Filter by Year</h4>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Card>

                  {/* Graph Statistics */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Graph Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Showing Abstracts:</span>
                        <span className="font-medium">{filteredAbstracts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Abstracts:</span>
                        <span className="font-medium text-gray-500">{abstracts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extracted Entities:</span>
                        <span className="font-medium">{graphData.nodes.filter(n => n.type === 'entity').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connections:</span>
                        <span className="font-medium">{graphData.links.length}</span>
                      </div>
                      {selectedYear !== 'all' && (
                        <div className="pt-2 border-t">
                          <span className="text-xs text-blue-600">Filtered by: {selectedYear}</span>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Legend */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Legend</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Abstract Centers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm">Extracted Entities</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Each blue node represents one abstract with its connected orange entity nodes showing extracted keywords and concepts.
                      </div>
                    </div>
                  </Card>

                  {/* Quick Info */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 rounded text-blue-800">
                        <strong>Abstracts:</strong> {filteredAbstracts.length} {selectedYear !== 'all' ? `(${selectedYear})` : 'total'}
                      </div>
                      <div className="p-2 bg-orange-50 rounded text-orange-800">
                        <strong>Entities:</strong> {graphData.nodes.filter(n => n.type === 'entity').length} unique
                      </div>
                      <div className="p-2 bg-green-50 rounded text-green-800">
                        <strong>Connections:</strong> {graphData.links.length} links
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Entity Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedNode?.abstract?.title || 'Abstract Details'}
                </DialogTitle>
              </DialogHeader>
              
              {selectedNode && selectedNode.abstract && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Authors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.abstract.authors?.map((author: string, index: number) => (
                        <Badge key={index} variant="outline">{author}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Abstract Content</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedNode.abstract.abstract}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.abstract.keywords?.map((keyword: string, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedNode.abstract.extracted_entities && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Extracted Entities</h4>
                      <div className="space-y-2">
                        {selectedNode.abstract.extracted_entities.technologies?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Technologies:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.abstract.extracted_entities.technologies.map((tech: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedNode.abstract.extracted_entities.domains?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Domains:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.abstract.extracted_entities.domains.map((domain: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedNode.abstract.extracted_entities.methodologies?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Methodologies:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.abstract.extracted_entities.methodologies.map((method: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Frequency Chart Tab */}
        <TabsContent value="frequency" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600">Loading frequency data...</p>
                </div>
              </CardContent>
            </Card>
          ) : frequencyData.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Zap className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">No frequency data available.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardHeader>
              <CardTitle>Research Entity Frequency</CardTitle>
              <CardDescription>
                Real-time analysis of top entities extracted from all approved research abstracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left pane - Bar Chart with Color Legend */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">Top Entities by Count</h4>
                  {frequencyData.map((item, index) => {
                    const colors = [
                      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
                      'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
                      'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-violet-500'
                    ];
                    const barColors = [
                      'from-blue-500 to-blue-600', 'from-indigo-500 to-indigo-600', 'from-purple-500 to-purple-600', 
                      'from-pink-500 to-pink-600', 'from-rose-500 to-rose-600', 'from-orange-500 to-orange-600', 
                      'from-amber-500 to-amber-600', 'from-yellow-500 to-yellow-600', 'from-lime-500 to-lime-600', 
                      'from-green-500 to-green-600', 'from-emerald-500 to-emerald-600', 'from-teal-500 to-teal-600', 
                      'from-cyan-500 to-cyan-600', 'from-sky-500 to-sky-600', 'from-violet-500 to-violet-600'
                    ];
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Color indicator matching donut chart */}
                          <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} flex-shrink-0`}></div>
                          <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-medium truncate">{item.category}</span>
                        </div>
                        <div className="flex items-center space-x-6 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-semibold">{item.count}</div>
                            <div className="text-sm text-gray-600">{item.percentage}%</div>
                          </div>
                          <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${barColors[index % barColors.length]} transition-all duration-300`}
                              style={{ width: `${Math.min(parseFloat(item.percentage), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right pane - Pie Chart Only */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">Distribution Overview</h4>
                  <div className="flex items-center justify-center py-4">
                    <PieChartComponent data={frequencyData} />
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-sm text-gray-700 mb-3">Summary Statistics</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Entities:</span>
                        <span className="font-bold text-lg text-blue-600">{frequencyData.reduce((sum, d) => sum + d.count, 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Unique Categories:</span>
                        <span className="font-semibold text-gray-700">{frequencyData.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Most Frequent:</span>
                        <span className="font-semibold text-gray-700">{frequencyData[0]?.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Top Entity Count:</span>
                        <span className="font-semibold text-gray-700">{frequencyData[0]?.count} ({frequencyData[0]?.percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-800 mb-1">Real-Time Entity Tracking</p>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          This chart displays the <strong>top {frequencyData.length} most frequent entities</strong> extracted from <strong>{filteredAbstracts.length} approved research abstracts</strong>.
                          Data includes technologies, domains, and methodologies, and updates automatically when new abstracts are approved.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visualization Tip */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-gray-700">Tip:</strong> The colors on the left match the pie chart slices. 
                      Hover over the pie chart for detailed information about each entity.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
