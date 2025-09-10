import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  GitBranch, 
  Maximize2, 
  Download, 
  Filter,
  Search,
  Network,
  Zap,
  X,
  FileText,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera,
  Scan,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as d3 from 'd3';

// Enhanced mock data - Each group represents one abstract with its extracted entities
const mockEntityData = {
  nodes: [
    // Abstract 1: AI & Sustainability
    { id: 'abstract1', label: '', type: 'abstract', size: 30, color: '#3b82f6', x: 200, y: 200 },
    { id: 'ai1', label: 'AI', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract1' },
    { id: 'satellite1', label: 'satellite', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract1' },
    { id: 'monitoring1', label: 'monitoring', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract1' },
    { id: 'machine_learning1', label: 'machine learning', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract1' },

    // Abstract 2: Smart Agriculture
    { id: 'abstract2', label: '', type: 'abstract', size: 30, color: '#3b82f6', x: 600, y: 200 },
    { id: 'infrastructure2', label: 'infrastructure', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'ai2', label: 'AI', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'satellite2', label: 'satellite', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'irrigation2', label: 'irrigation', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'monitoring2', label: 'monitoring', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'machine_learning2', label: 'machine learning', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },
    { id: 'sustainable2', label: 'sustainable', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract2' },

    // Abstract 3: Citizen Science & Biodiversity
    { id: 'abstract3', label: '', type: 'abstract', size: 30, color: '#3b82f6', x: 200, y: 500 },
    { id: 'citizen3', label: 'citizen', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract3' },
    { id: 'mapping3', label: 'mapping', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract3' },
    { id: 'biodiversity3', label: 'biodiversity', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract3' },
    { id: 'mobile3', label: 'mobile', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract3' },
    { id: 'crowdsourced3', label: 'crowdsourced', type: 'entity', size: 20, color: '#f97316', abstractId: 'abstract3' }
  ],
  links: [
    // Abstract 1 connections
    { source: 'abstract1', target: 'ai1', strength: 1.0, type: 'contains' },
    { source: 'abstract1', target: 'satellite1', strength: 1.0, type: 'contains' },
    { source: 'abstract1', target: 'monitoring1', strength: 1.0, type: 'contains' },
    { source: 'abstract1', target: 'machine_learning1', strength: 1.0, type: 'contains' },

    // Abstract 2 connections
    { source: 'abstract2', target: 'infrastructure2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'ai2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'satellite2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'irrigation2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'monitoring2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'machine_learning2', strength: 1.0, type: 'contains' },
    { source: 'abstract2', target: 'sustainable2', strength: 1.0, type: 'contains' },

    // Abstract 3 connections
    { source: 'abstract3', target: 'citizen3', strength: 1.0, type: 'contains' },
    { source: 'abstract3', target: 'mapping3', strength: 1.0, type: 'contains' },
    { source: 'abstract3', target: 'biodiversity3', strength: 1.0, type: 'contains' },
    { source: 'abstract3', target: 'mobile3', strength: 1.0, type: 'contains' },
    { source: 'abstract3', target: 'crowdsourced3', strength: 1.0, type: 'contains' }
  ],
  abstracts: [
    {
      id: 'abstract1',
      title: 'AI-Powered Sustainability Monitoring',
      content: 'AI technologies offer promising solutions in sustainability monitoring, using satellite imagery and machine learning.',
      keywords: ['AI', 'machine learning', 'satellite', 'monitoring']
    },
    {
      id: 'abstract2', 
      title: 'Smart Agricultural Infrastructure',
      content: 'Development of intelligent infrastructure systems for sustainable agricultural practices using AI and satellite monitoring.',
      keywords: ['infrastructure', 'AI', 'satellite', 'irrigation', 'monitoring', 'machine learning', 'sustainable']
    },
    {
      id: 'abstract3',
      title: 'Citizen Science for Biodiversity Conservation', 
      content: 'Mobile crowdsourced mapping applications for citizen science initiatives in biodiversity conservation.',
      keywords: ['citizen', 'mapping', 'biodiversity', 'mobile', 'crowdsourced']
    }
  ]
};

// Mock frequency data
const mockFrequencyData = [
  { category: 'AI & Machine Learning', count: 45, trend: 'up', percentage: 18.2 },
  { category: 'Satellite Technology', count: 38, trend: 'up', percentage: 15.4 },
  { category: 'Environmental Monitoring', count: 32, trend: 'up', percentage: 13.0 },
  { category: 'Sustainable Technology', count: 28, trend: 'stable', percentage: 11.4 },
  { category: 'Infrastructure Systems', count: 25, trend: 'up', percentage: 10.1 },
  { category: 'Mobile Applications', count: 22, trend: 'down', percentage: 8.9 },
  { category: 'Citizen Science', count: 18, trend: 'up', percentage: 7.3 },
  { category: 'Biodiversity Conservation', count: 15, trend: 'stable', percentage: 6.1 }
];

export const FacultyVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // D3.js Force-Directed Graph Implementation
  const renderForceGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width * 0.65; // Adjust for 2-pane layout
    const height = dimensions.height;

    // Create separate force simulations for each abstract group
    const abstractNodes = mockEntityData.nodes.filter(n => n.type === 'abstract');
    const entityNodes = mockEntityData.nodes.filter(n => n.type === 'entity');

    // Create force simulation with custom forces for grouping
    const simulation = d3.forceSimulation(mockEntityData.nodes as any)
      .force("link", d3.forceLink(mockEntityData.links).id((d: any) => d.id).distance(80).strength(0.8))
      .force("charge", d3.forceManyBody().strength((d: any) => d.type === 'abstract' ? -800 : -200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.size + 10))
      .force("group", d3.forceRadial(100, width / 2, height / 2).strength(0.1));

    // Add grouping force to keep entities close to their abstract
    simulation.force("grouping", () => {
      entityNodes.forEach(entity => {
        const abstract = abstractNodes.find(a => a.id === (entity as any).abstractId);
        if (abstract) {
          const dx = (abstract as any).x - (entity as any).x;
          const dy = (abstract as any).y - (entity as any).y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 120) {
            (entity as any).vx += dx * 0.1;
            (entity as any).vy += dy * 0.1;
          }
        }
      });
    });

    // Create links (edges)
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(mockEntityData.links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create node groups
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(mockEntityData.nodes)
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
        // Find the abstract for this entity or use the node itself if it's an abstract
        const abstractData = d.type === 'abstract' 
          ? mockEntityData.abstracts.find(a => a.id === d.id)
          : mockEntityData.abstracts.find(a => a.id === d.abstractId);
        
        setSelectedNode({ ...d, abstract: abstractData });
        setIsModalOpen(true);
      })
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.size + 3)
          .attr("stroke-width", 3);
        
        // Highlight connected nodes
        const connectedLinks = mockEntityData.links.filter(l => l.source === d.id || l.target === d.id);
        const connectedNodeIds = connectedLinks.map(l => l.source === d.id ? l.target : l.source);
        
        node.selectAll("circle")
          .style("opacity", (n: any) => connectedNodeIds.includes(n.id) || n.id === d.id ? 1 : 0.3);
        
        link.style("opacity", (l: any) => l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.1);
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.size)
          .attr("stroke-width", 2);
        
        // Reset all nodes and links opacity
        node.selectAll("circle").style("opacity", 1);
        link.style("opacity", 0.6);
      });

    // Add labels beside nodes (not inside)
    node.append("text")
      .text((d: any) => d.label)
      .attr("font-size", 12)
      .attr("font-family", "Arial, sans-serif")
      .attr("text-anchor", "start")
      .attr("dx", (d: any) => d.size + 8) // Position text beside the node
      .attr("dy", ".35em")
      .attr("fill", "#333")
      .attr("font-weight", (d: any) => d.type === 'abstract' ? 'bold' : 'normal')
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

  }, [dimensions]);

  useEffect(() => {
    renderForceGraph();
  }, [renderForceGraph]);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
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
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Graph
          </Button>
          <Button variant="outline">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
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
              {/* 2-Pane Layout */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left Pane - Interactive Graph (2/3 width) */}
                <div className="col-span-2">
                  <div className="relative w-full bg-white rounded-lg border overflow-hidden">
                    <svg 
                      ref={svgRef} 
                      width={dimensions.width * 0.65} 
                      height={dimensions.height}
                      className="w-full h-full"
                    >
                    </svg>
                    {/* Instructions overlay */}
                    <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-sm border max-w-xs">
                      <h4 className="text-sm font-medium mb-2">Interactive Controls:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Click any node to view abstract details</li>
                        <li>• Drag nodes to rearrange groups</li>
                        <li>• Scroll to zoom in/out</li>
                        <li>• Hover to highlight connections</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Pane - Legend and Statistics (1/3 width) */}
                <div className="col-span-1 space-y-4">
                  {/* Graph Statistics */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Graph Statistics</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Total Abstracts:</span>
                        <span className="font-medium">{mockEntityData.abstracts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Extracted Entities:</span>
                        <span className="font-medium">{mockEntityData.nodes.filter(n => n.type === 'entity').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Keywords:</span>
                        <span className="font-medium">{mockEntityData.abstracts.reduce((acc, abs) => acc + abs.keywords.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connections:</span>
                        <span className="font-medium">{mockEntityData.links.length}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Legend */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Legend</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Abstract Centers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-sm">Extracted Entities</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Each blue node represents one abstract with its connected orange entity nodes showing extracted keywords and concepts.
                      </div>
                    </div>
                  </Card>

                  {/* Abstract Details */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Quick Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 rounded text-blue-800">
                        <strong>Abstracts:</strong> {mockEntityData.abstracts.length} research papers
                      </div>
                      <div className="p-2 bg-orange-50 rounded text-orange-800">
                        <strong>Entities:</strong> {mockEntityData.nodes.filter(n => n.type === 'entity').length} unique keywords
                      </div>
                      <div className="p-2 bg-green-50 rounded text-green-800">
                        <strong>Connections:</strong> {mockEntityData.links.length} relationships
                      </div>
                    </div>
                  </Card>

                  {/* Most Connected Entities */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Top Entities</h4>
                    <div className="space-y-2 text-sm">
                      {mockEntityData.nodes
                        .filter(n => n.type === 'entity')
                        .slice(0, 5)
                        .map((entity, index) => (
                          <div key={entity.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{entity.label}</span>
                            <div className="w-12 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-2 bg-blue-500 rounded"
                                style={{ width: `${(entity.size / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entity Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Abstract Details</DialogTitle>
              </DialogHeader>
              
              {selectedNode && selectedNode.abstract && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Abstract</h4>
                    <p className="text-sm text-gray-600">
                      {selectedNode.abstract.content}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.abstract.keywords.map((keyword: string, index: number) => (
                        <div key={index} className="px-3 py-1 border-b border-gray-200 text-sm">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Frequency Chart Tab */}
        <TabsContent value="frequency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Category Frequency</CardTitle>
              <CardDescription>Analysis of research categories and their usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFrequencyData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        item.trend === 'up' ? 'bg-green-500' : 
                        item.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-semibold">{item.count}</div>
                        <div className="text-sm text-gray-600">{item.percentage}%</div>
                      </div>
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${item.percentage * 5}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
