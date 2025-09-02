import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Maximize2, 
  Download, 
  Filter,
  Search,
  Eye,
  Layers,
  Network,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for entity visualization
const mockEntityData = {
  nodes: [
    // Technologies
    { id: 'ml', label: 'Machine Learning', type: 'technology', size: 25, color: '#3b82f6' },
    { id: 'python', label: 'Python', type: 'technology', size: 20, color: '#3b82f6' },
    { id: 'tensorflow', label: 'TensorFlow', type: 'technology', size: 18, color: '#3b82f6' },
    { id: 'react', label: 'React', type: 'technology', size: 22, color: '#3b82f6' },
    { id: 'nodejs', label: 'Node.js', type: 'technology', size: 19, color: '#3b82f6' },
    { id: 'postgresql', label: 'PostgreSQL', type: 'technology', size: 16, color: '#3b82f6' },
    { id: 'flutter', label: 'Flutter', type: 'technology', size: 17, color: '#3b82f6' },
    
    // Domains
    { id: 'education', label: 'Educational Technology', type: 'domain', size: 28, color: '#10b981' },
    { id: 'webdev', label: 'Web Development', type: 'domain', size: 26, color: '#10b981' },
    { id: 'databases', label: 'Database Systems', type: 'domain', size: 24, color: '#10b981' },
    { id: 'mobile', label: 'Mobile Development', type: 'domain', size: 23, color: '#10b981' },
    { id: 'ai', label: 'Artificial Intelligence', type: 'domain', size: 27, color: '#10b981' },
    
    // Research Papers (Student's abstracts)
    { id: 'paper1', label: 'ML in Education', type: 'paper', size: 15, color: '#f59e0b' },
    { id: 'paper2', label: 'E-commerce Platform', type: 'paper', size: 15, color: '#f59e0b' },
    { id: 'paper3', label: 'DB Optimization', type: 'paper', size: 15, color: '#f59e0b' },
    { id: 'paper4', label: 'Healthcare App', type: 'paper', size: 15, color: '#f59e0b' },
    
    // Authors/Researchers
    { id: 'john', label: 'John Smith', type: 'author', size: 12, color: '#ef4444' },
    { id: 'maria', label: 'Maria Garcia', type: 'author', size: 10, color: '#ef4444' },
    { id: 'ahmed', label: 'Ahmed Hassan', type: 'author', size: 10, color: '#ef4444' },
    
    // Institutions
    { id: 'nbsc', label: 'NBSC-ICS', type: 'institution', size: 30, color: '#8b5cf6' }
  ],
  links: [
    // Technology-Domain relationships
    { source: 'ml', target: 'education', strength: 0.9, type: 'uses' },
    { source: 'ml', target: 'ai', strength: 0.8, type: 'uses' },
    { source: 'python', target: 'ml', strength: 0.9, type: 'implements' },
    { source: 'tensorflow', target: 'ml', strength: 0.8, type: 'implements' },
    { source: 'react', target: 'webdev', strength: 0.9, type: 'implements' },
    { source: 'nodejs', target: 'webdev', strength: 0.8, type: 'implements' },
    { source: 'postgresql', target: 'databases', strength: 0.9, type: 'implements' },
    { source: 'flutter', target: 'mobile', strength: 0.9, type: 'implements' },
    
    // Paper-Technology relationships
    { source: 'paper1', target: 'ml', strength: 0.9, type: 'uses' },
    { source: 'paper1', target: 'python', strength: 0.8, type: 'uses' },
    { source: 'paper1', target: 'tensorflow', strength: 0.7, type: 'uses' },
    { source: 'paper2', target: 'react', strength: 0.9, type: 'uses' },
    { source: 'paper2', target: 'nodejs', strength: 0.8, type: 'uses' },
    { source: 'paper3', target: 'postgresql', strength: 0.9, type: 'uses' },
    { source: 'paper4', target: 'flutter', strength: 0.9, type: 'uses' },
    
    // Paper-Domain relationships
    { source: 'paper1', target: 'education', strength: 0.9, type: 'contributes' },
    { source: 'paper1', target: 'ai', strength: 0.7, type: 'contributes' },
    { source: 'paper2', target: 'webdev', strength: 0.9, type: 'contributes' },
    { source: 'paper3', target: 'databases', strength: 0.9, type: 'contributes' },
    { source: 'paper4', target: 'mobile', strength: 0.9, type: 'contributes' },
    
    // Author-Paper relationships
    { source: 'john', target: 'paper1', strength: 1.0, type: 'authored' },
    { source: 'john', target: 'paper2', strength: 1.0, type: 'authored' },
    { source: 'john', target: 'paper3', strength: 1.0, type: 'authored' },
    { source: 'john', target: 'paper4', strength: 1.0, type: 'authored' },
    
    // Institution relationships
    { source: 'john', target: 'nbsc', strength: 1.0, type: 'affiliated' },
    { source: 'maria', target: 'nbsc', strength: 1.0, type: 'affiliated' },
    { source: 'ahmed', target: 'nbsc', strength: 1.0, type: 'affiliated' }
  ]
};

// Mock tag cloud data
const mockTagCloud = [
  { text: 'Machine Learning', weight: 45, category: 'technology' },
  { text: 'Python', weight: 38, category: 'technology' },
  { text: 'React', weight: 35, category: 'technology' },
  { text: 'Web Development', weight: 32, category: 'domain' },
  { text: 'Educational Technology', weight: 30, category: 'domain' },
  { text: 'Data Science', weight: 28, category: 'domain' },
  { text: 'TensorFlow', weight: 25, category: 'technology' },
  { text: 'Node.js', weight: 24, category: 'technology' },
  { text: 'JavaScript', weight: 22, category: 'technology' },
  { text: 'Mobile Development', weight: 20, category: 'domain' },
  { text: 'Flutter', weight: 18, category: 'technology' },
  { text: 'PostgreSQL', weight: 16, category: 'technology' },
  { text: 'Database Systems', weight: 15, category: 'domain' },
  { text: 'Artificial Intelligence', weight: 14, category: 'domain' },
  { text: 'Firebase', weight: 12, category: 'technology' }
];

// Mock frequency data
const mockFrequencyData = [
  { category: 'Machine Learning', count: 45, trend: 'up', percentage: 18.2 },
  { category: 'Web Development', count: 38, trend: 'up', percentage: 15.4 },
  { category: 'Data Science', count: 32, trend: 'up', percentage: 13.0 },
  { category: 'Mobile Development', count: 28, trend: 'stable', percentage: 11.4 },
  { category: 'Artificial Intelligence', count: 25, trend: 'up', percentage: 10.1 },
  { category: 'Database Systems', count: 22, trend: 'down', percentage: 8.9 },
  { category: 'Cybersecurity', count: 18, trend: 'up', percentage: 7.3 },
  { category: 'Computer Networks', count: 15, trend: 'stable', percentage: 6.1 }
];

export const EntityVisualization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('graph');
  const [selectedNodeType, setSelectedNodeType] = useState('all');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Simulate D3.js force-directed graph (placeholder implementation)
  const renderForceGraph = () => {
    // This would be replaced with actual D3.js implementation
    return (
      <div className="relative w-full h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Force-Directed Graph</h3>
          <p className="text-gray-600 mb-4">
            D3.js visualization showing entity relationships will be rendered here
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Blue nodes: Technologies (Python, React, etc.)</p>
            <p>• Green nodes: Research domains (ML, Web Dev, etc.)</p>
            <p>• Orange nodes: Your research papers</p>
            <p>• Red nodes: Authors and researchers</p>
            <p>• Purple nodes: Institutions</p>
          </div>
        </div>
      </div>
    );
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'technology': return 'bg-blue-100 text-blue-800';
      case 'domain': return 'bg-green-100 text-green-800';
      case 'paper': return 'bg-orange-100 text-orange-800';
      case 'author': return 'bg-red-100 text-red-800';
      case 'institution': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNodes = selectedNodeType === 'all' 
    ? mockEntityData.nodes 
    : mockEntityData.nodes.filter(node => node.type === selectedNodeType);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="graph" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Force Graph
          </TabsTrigger>
          <TabsTrigger value="nodes" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Entity Explorer
          </TabsTrigger>
          <TabsTrigger value="cloud" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tag Cloud
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
                  <CardDescription>Explore connections between your research entities</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedNodeType} onValueChange={setSelectedNodeType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter nodes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      <SelectItem value="technology">Technologies</SelectItem>
                      <SelectItem value="domain">Domains</SelectItem>
                      <SelectItem value="paper">Papers</SelectItem>
                      <SelectItem value="author">Authors</SelectItem>
                      <SelectItem value="institution">Institutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderForceGraph()}
              
              {/* Graph Controls */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Graph Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Entities:</span>
                      <span className="font-medium">{mockEntityData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connections:</span>
                      <span className="font-medium">{mockEntityData.links.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Papers:</span>
                      <span className="font-medium">{mockEntityData.nodes.filter(n => n.type === 'paper').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technologies Used:</span>
                      <span className="font-medium">{mockEntityData.nodes.filter(n => n.type === 'technology').length}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium mb-3">Legend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Technologies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Research Domains</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Your Papers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Authors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Institutions</span>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entity Explorer Tab */}
        <TabsContent value="nodes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity Explorer</CardTitle>
              <CardDescription>Browse and analyze individual entities and their properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {['all', 'technology', 'domain', 'paper', 'author'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedNodeType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedNodeType(type)}
                    className="capitalize"
                  >
                    {type === 'all' ? 'All Types' : `${type}s`}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNodes.map((node) => (
                  <Card key={node.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{node.label}</h4>
                        <Badge className={getNodeTypeColor(node.type)}>
                          {node.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Connections:</span>
                          <span>{mockEntityData.links.filter(l => l.source === node.id || l.target === node.id).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relevance:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 bg-gray-200 rounded">
                              <div 
                                className="h-1 bg-blue-500 rounded"
                                style={{ width: `${(node.size / 30) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{Math.round((node.size / 30) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tag Cloud Tab */}
        <TabsContent value="cloud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Tag Cloud</CardTitle>
              <CardDescription>Visual representation of your most used research terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 min-h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900">Interactive Tag Cloud</h3>
                  <p className="text-gray-600">
                    Word cloud visualization showing frequency of terms in your research
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {mockTagCloud.slice(0, 10).map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className={`text-${Math.floor(tag.weight / 15) + 1}xl ${
                          tag.category === 'technology' ? 'border-blue-300 text-blue-700' : 'border-green-300 text-green-700'
                        }`}
                        style={{ 
                          fontSize: `${Math.max(12, tag.weight / 3)}px`,
                          opacity: tag.weight / 50
                        }}
                      >
                        {tag.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
