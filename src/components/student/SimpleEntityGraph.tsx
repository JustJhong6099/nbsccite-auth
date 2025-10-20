import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X, Info } from 'lucide-react';

interface Entity {
  id: string;
  label: string;
  types: string[];
  confidence: number;
  abstract?: string;
  uri?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'abstract' | 'entity';
  entityData?: Entity;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface VisualizationData {
  text: string;
  entities: Entity[];
}

interface SimpleEntityGraphProps {
  data: VisualizationData;
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleEntityGraph: React.FC<SimpleEntityGraphProps> = ({
  data,
  isOpen,
  onClose
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Interactive controls state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [displayedEntities, setDisplayedEntities] = useState(0);
  const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const stats = {
    totalAbstracts: 1,
    extractedEntities: data.entities.length,
    displayedEntities: displayedEntities,
    totalKeywords: data.entities.filter(e => e.types.some(t => t.toLowerCase().includes('keyword') || t.toLowerCase().includes('topic'))).length,
    connections: displayedEntities
  };

  // Function to get color based on entity type for UI elements
  const getEntityTypeColorForUI = (type: string): string => {
    const typeColors: Record<string, string> = {
      'Person': '#ef4444',
      'Organization': '#10b981',
      'Location': '#8b5cf6',
      'Technology': '#f59e0b',
      'Concept': '#06b6d4',
      'Event': '#ec4899',
      'default': '#6b7280'
    };
    return typeColors[type] || typeColors.default;
  };

  // Function to calculate IT relevance score
  const calculateITRelevance = (entity: Entity): number => {
    const itKeywords = [
      'computer', 'software', 'hardware', 'algorithm', 'data', 'network', 'system',
      'programming', 'code', 'application', 'database', 'technology', 'digital',
      'machine learning', 'ai', 'artificial intelligence', 'cloud', 'security',
      'web', 'mobile', 'api', 'framework', 'development', 'server', 'client',
      'javascript', 'python', 'java', 'react', 'node', 'innovation', 'blockchain',
      'iot', 'analytics', 'platform', 'architecture', 'interface', 'automation',
      'neural', 'deep learning', 'model', 'training', 'dataset', 'prediction'
    ];

    const itTypes = [
      'Technology', 'Software', 'Algorithm', 'ProgrammingLanguage', 'Framework',
      'Database', 'Protocol', 'DataStructure', 'Tool', 'Platform', 'System'
    ];

    let score = 0;
    const labelLower = entity.label.toLowerCase();
    
    // Check label against IT keywords (weight: 2)
    itKeywords.forEach(keyword => {
      if (labelLower.includes(keyword)) score += 2;
    });
    
    // Check types (weight: 3)
    entity.types.forEach(type => {
      if (itTypes.some(itType => type.includes(itType))) score += 3;
    });
    
    // Add confidence as tiebreaker (weight: 1)
    score += entity.confidence;
    
    return score;
  };

  useEffect(() => {
    if (!isOpen || !svgRef.current || !data?.entities?.length) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = 800;
      const height = 600;

      // Filter and rank entities by IT relevance, removing duplicates
      const seenLabels = new Set<string>();
      const uniqueEntities = data.entities
        .map(entity => ({
          entity,
          score: calculateITRelevance(entity)
        }))
        .sort((a, b) => b.score - a.score)
        .filter(item => {
          // Check for duplicates (case-insensitive)
          const normalizedLabel = item.entity.label.toLowerCase().trim();
          if (seenLabels.has(normalizedLabel)) {
            return false; // Skip duplicate
          }
          seenLabels.add(normalizedLabel);
          return true;
        });

      // If less than 12 unique entities, show all; otherwise show top 10 IT-related
      const rankedEntities = uniqueEntities.length < 12
        ? uniqueEntities.map(item => item.entity)
        : uniqueEntities.slice(0, 10).map(item => item.entity);

      console.log(`Filtered ${data.entities.length} entities down to ${rankedEntities.length} unique entities (${uniqueEntities.length < 12 ? 'showing all' : 'top 10 IT-related'})`);
      
      // Update displayed entities count
      setDisplayedEntities(rankedEntities.length);

      // Add zoom and pan behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
          setZoomLevel(event.transform.k);
        });

      svg.call(zoom);
      zoomBehaviorRef.current = zoom;

      // Create container for all elements
      const container = svg.append("g");

      // Create nodes with filtered entities
      const nodes: GraphNode[] = [
        {
          id: 'abstract-center',
          label: 'Abstract',
          type: 'abstract',
          x: width / 2,
          y: height / 2
        },
        ...rankedEntities.map((entity, i) => ({
          id: entity.id,
          label: entity.label,
          type: 'entity' as const,
          entityData: entity
        }))
      ];

      // Create links for filtered entities only
      const links: GraphLink[] = rankedEntities.map(entity => ({
        source: 'abstract-center',
        target: entity.id
      }));

      // Create simulation with simpler forces for cleaner layout
      const simulation = d3.forceSimulation<GraphNode>(nodes)
        .force('link', d3.forceLink<GraphNode, GraphLink>(links)
          .id(d => d.id)
          .distance(150) // Increased distance for cleaner spacing
        )
        .force('charge', d3.forceManyBody().strength(-400)) // Stronger repulsion for spread
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50)); // Larger collision radius

      // Create simple, clean links
      const link = container.selectAll('.link')
        .data(links)
        .enter().append('line')
        .attr('class', 'link')
        .attr('stroke', '#94a3b8') // Light gray color
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.6);

      // Create simple node groups
      const nodeGroup = container.selectAll('.node-group')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node-group')
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          setSelectedNode(d);
        })
        .on('mouseover', function(event, d) {
          // Highlight node
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', d.type === 'abstract' ? 55 : 28);
          
          // Highlight connected links
          link.style('stroke-opacity', (l: any) => 
            (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2
          )
          .style('stroke-width', (l: any) => 
            (l.source.id === d.id || l.target.id === d.id) ? 3 : 2
          );
        })
        .on('mouseout', function(event, d) {
          // Reset node
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', d.type === 'abstract' ? 50 : 25);
          
          // Reset all links
          link.style('stroke-opacity', 0.6)
            .style('stroke-width', 2);
        });

      // Add simple circles - no extra decorations
      const node = nodeGroup.append('circle')
        .attr('r', d => d.type === 'abstract' ? 50 : 25)
        .attr('fill', d => d.type === 'abstract' ? '#3b82f6' : '#f97316')
        .attr('stroke', 'none'); // Remove stroke for cleaner look

      // Add simple labels
      const labels = nodeGroup.append('text')
        .attr('class', 'label')
        .text(d => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
        .attr('font-size', d => d.type === 'abstract' ? '14px' : '11px')
        .attr('font-weight', d => d.type === 'abstract' ? 'bold' : 'normal')
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.type === 'abstract' ? 65 : 38)
        .attr('fill', '#1f2937')
        .style('pointer-events', 'none');

      // Update positions on tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => (d.source as GraphNode).x || 0)
          .attr('y1', d => (d.source as GraphNode).y || 0)
          .attr('x2', d => (d.target as GraphNode).x || 0)
          .attr('y2', d => (d.target as GraphNode).y || 0);

        nodeGroup
          .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
      });

      // Store simulation reference for controls
      simulationRef.current = simulation;

      return () => {
        simulation.stop();
      };

    } catch (error) {
      console.error('Error creating simple visualization:', error);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  if (!data || !data.entities || data.entities.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600">No entities were found to visualize.</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Entity Knowledge Graph</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-12rem)]">
          {/* Main Visualization */}
          <div className="flex-1 relative">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 600"
              className="border-r border-gray-200"
            />
            
            {/* Instructions Card - Top Left */}
            <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-md max-w-xs">
              <div className="p-3">
                <h4 className="font-semibold text-xs text-gray-900 mb-2 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-600" />
                  Interactive Instructions
                </h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Click any node to view details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Drag nodes to rearrange</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Scroll to zoom in/out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>Hover to highlight connections</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Statistics */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Graph Statistics</h3>
              
              {/* Filter Notice */}
              {stats.extractedEntities > stats.displayedEntities && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-800">
                    <span className="font-semibold">Showing top {stats.displayedEntities}</span> most IT-related entities
                    <br />
                    <span className="text-blue-600">from {stats.extractedEntities} total extracted</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-blue-600">{stats.totalAbstracts}</div>
                  <div className="text-xs text-gray-600">Abstracts</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-orange-600">{stats.extractedEntities}</div>
                  <div className="text-xs text-gray-600">Total Entities</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-green-600">{stats.displayedEntities}</div>
                  <div className="text-xs text-gray-600">IT Entities</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-purple-600">{stats.connections}</div>
                  <div className="text-xs text-gray-600">Connections</div>
                </div>
              </div>
            </div>

            {/* Node Details */}
            {selectedNode ? (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  {selectedNode.type === 'abstract' ? 'Abstract Details' : 'Node Details'}
                </h3>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${selectedNode.type === 'abstract' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                    <h4 className="font-medium text-sm">{selectedNode.label}</h4>
                  </div>
                  
                  {selectedNode.type === 'abstract' ? (
                    <div className="space-y-4">
                      {/* Knowledge Transformation Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border">
                        <h5 className="font-semibold text-sm text-gray-900 mb-1">Knowledge Transformation</h5>
                        <p className="text-xs text-gray-600">Unstructured text → Structured knowledge</p>
                      </div>

                      {/* Raw Unstructured Abstract */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-gray-400 rounded"></div>
                          <h5 className="font-medium text-sm text-gray-900">Raw Abstract (Unstructured)</h5>
                        </div>
                        <div className="text-xs text-gray-700 bg-gray-100 p-3 rounded border-l-4 border-gray-400 max-h-32 overflow-y-auto font-mono leading-relaxed">
                          {data.text || 'No abstract text available.'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 italic">↑ Plain text from research paper</p>
                      </div>
                      
                      {/* Transformation Arrow */}
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <div className="w-8 h-0.5 bg-indigo-300"></div>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          <div className="w-8 h-0.5 bg-indigo-300"></div>
                        </div>
                      </div>

                      {/* Structured Knowledge Representation */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                          <h5 className="font-medium text-sm text-gray-900">Structured Knowledge (Extracted Entities)</h5>
                        </div>
                        
                        {/* Entity Categories */}
                        <div className="space-y-3">
                          {/* Group entities by type */}
                          {Object.entries(
                            data.entities.reduce((groups: Record<string, Entity[]>, entity) => {
                              const primaryType = entity.types[0] || 'Other';
                              if (!groups[primaryType]) groups[primaryType] = [];
                              groups[primaryType].push(entity);
                              return groups;
                            }, {})
                          ).map(([type, entities]) => (
                            <div key={type} className="bg-white border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getEntityTypeColorForUI(type) }}
                                ></div>
                                <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                                  {type} ({entities.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {entities.map((entity, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full border"
                                    style={{ 
                                      backgroundColor: `${getEntityTypeColorForUI(type)}15`,
                                      borderColor: getEntityTypeColorForUI(type),
                                      color: getEntityTypeColorForUI(type)
                                    }}
                                  >
                                    {entity.label}
                                    <span className="ml-1 text-gray-500">
                                      {Math.round(entity.confidence * 100)}%
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-xs text-indigo-600 mt-2 italic">↑ AI-extracted semantic entities with confidence scores</p>
                      </div>

                      {/* Knowledge Insights */}
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <h6 className="font-medium text-xs text-indigo-900 mb-2">Knowledge Insights</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-indigo-700">
                            <span className="font-medium">Total Entities:</span> {data.entities.length}
                          </div>
                          <div className="text-indigo-700">
                            <span className="font-medium">Avg Confidence:</span> {
                              data.entities.length > 0 
                                ? Math.round(data.entities.reduce((sum, e) => sum + e.confidence, 0) / data.entities.length * 100)
                                : 0
                            }%
                          </div>
                          <div className="text-indigo-700">
                            <span className="font-medium">Entity Types:</span> {
                              new Set(data.entities.flatMap(e => e.types)).size
                            }
                          </div>
                          <div className="text-indigo-700">
                            <span className="font-medium">Connections:</span> {data.entities.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedNode.entityData && (
                    <div className="space-y-3">
                      {/* Entity Type with Color Indicator */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border"
                          style={{ 
                            backgroundColor: getEntityTypeColorForUI(selectedNode.entityData.types[0]),
                            borderColor: getEntityTypeColorForUI(selectedNode.entityData.types[0])
                          }}
                        ></div>
                        <span className="text-xs font-medium">
                          {selectedNode.entityData.types.join(', ')}
                        </span>
                      </div>

                      {/* Confidence Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">Confidence</span>
                          <span className="text-xs font-bold text-blue-600">
                            {(selectedNode.entityData.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${selectedNode.entityData.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Entity Description */}
                      {selectedNode.entityData.abstract && (
                        <div>
                          <span className="text-xs font-medium block mb-1">Knowledge Base</span>
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border max-h-24 overflow-y-auto">
                            {selectedNode.entityData.abstract}
                          </div>
                        </div>
                      )}

                      {/* Related Connections */}
                      <div>
                        <span className="text-xs font-medium block mb-1">Connections</span>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Connected to Abstract Center</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
                <div className="bg-white p-3 rounded border text-xs text-gray-600">
                  <p><strong>Click</strong> on nodes to view details</p>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Quick Info
              </h3>
              <div className="bg-white p-3 rounded border text-xs text-gray-600">
                <p><strong>Abstracts:</strong> {stats.totalAbstracts}</p>
                <p><strong>Entities:</strong> {stats.extractedEntities}</p>
                <p><strong>Connections:</strong> {stats.connections}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};