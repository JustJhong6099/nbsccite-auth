import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

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
  group: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
}

interface VisualizationData {
  text: string;
  entities: Entity[];
}

interface EntityGraphModalProps {
  data: VisualizationData;
  isOpen: boolean;
  onClose: () => void;
}

export const EntityGraphModal: React.FC<EntityGraphModalProps> = ({
  data,
  isOpen,
  onClose
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const stats = {
    totalAbstracts: 1,
    extractedEntities: data.entities.length,
    totalKeywords: data.entities.filter(e => e.types.includes('Keyword') || e.types.includes('Topic')).length,
    connections: data.entities.length // Each entity connects to the abstract
  };

  useEffect(() => {
    console.log('EntityGraphModal useEffect triggered:', { isOpen, data, svgRefCurrent: !!svgRef.current });
    
    if (!isOpen || !svgRef.current || !data?.entities?.length) {
      console.log('Early return - conditions not met');
      return;
    }

    try {
      console.log('D3 version:', d3.version);
      const svg = d3.select(svgRef.current);
      if (svg.empty()) {
        console.log('SVG selection is empty');
        return;
      }
      
      console.log('SVG element found, clearing existing content');
      svg.selectAll("*").remove();

      const width = 800;
      const height = 600;

    // Create nodes: one abstract center + entity nodes
    const nodes: GraphNode[] = [
      {
        id: 'abstract-center',
        label: 'Research Abstract',
        type: 'abstract',
        group: 0,
        x: width / 2,
        y: height / 2
      },
      ...data.entities.map((entity, i) => ({
        id: entity.id,
        label: entity.label,
        type: 'entity' as const,
        entityData: entity,
        group: 1
      }))
    ];

    // Create links: each entity connects to the abstract center
    const links: GraphLink[] = data.entities.map(entity => ({
      source: 'abstract-center',
      target: entity.id,
      value: entity.confidence
    }));

    // Create simulation
    console.log('Creating simulation with nodes:', nodes.length, 'links:', links.length);
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id((d: GraphNode) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create main group for zooming/panning
    const g = svg.append('g');

    // Create zoom behavior after g is created
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        if (event && event.transform && g) {
          g.attr('transform', event.transform);
        }
      });

    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value * 5));

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.type === 'abstract' ? 25 : 15)
      .attr('fill', d => d.type === 'abstract' ? '#3b82f6' : '#f97316') // Blue for abstract, orange for entities
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event?.active) simulation.alphaTarget(0.3).restart();
          if (d && typeof d.x !== 'undefined' && typeof d.y !== 'undefined') {
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on('drag', (event, d) => {
          if (d && event && typeof event.x !== 'undefined' && typeof event.y !== 'undefined') {
            d.fx = event.x;
            d.fy = event.y;
          }
        })
        .on('end', (event, d) => {
          if (!event?.active) simulation.alphaTarget(0);
          if (d) {
            d.fx = null;
            d.fy = null;
          }
        }));

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
      .attr('font-size', d => d.type === 'abstract' ? '12px' : '10px')
      .attr('font-weight', d => d.type === 'abstract' ? 'bold' : 'normal')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'abstract' ? 35 : 25)
      .attr('fill', '#333')
      .style('pointer-events', 'none');

    // Add hover and click events
    node
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'abstract' ? 30 : 20)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'abstract' ? 25 : 15)
          .attr('stroke-width', 2);
      })
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const source = d.source as GraphNode;
          return source?.x || 0;
        })
        .attr('y1', d => {
          const source = d.source as GraphNode;
          return source?.y || 0;
        })
        .attr('x2', d => {
          const target = d.target as GraphNode;
          return target?.x || 0;
        })
        .attr('y2', d => {
          const target = d.target as GraphNode;
          return target?.y || 0;
        });

      node
        .attr('cx', d => d?.x || 0)
        .attr('cy', d => d?.y || 0);

      labels
        .attr('x', d => d?.x || 0)
        .attr('y', d => d?.y || 0);
    });

      return () => {
        simulation.stop();
      };
    } catch (error) {
      console.error('Error creating visualization:', error);
    }
  }, [isOpen, data]);

  const handleZoomIn = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1 / 1.5);
    }
  };

  const handleReset = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

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
          <p className="text-gray-600">No entities were found to visualize. Please try extracting entities from text first.</p>
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
            
            {/* Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-50"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-3 shadow">
              <h4 className="font-medium text-sm mb-2">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Abstract Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-xs">Extracted Entities</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 p-4 overflow-y-auto">
            {/* Statistics */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Graph Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-blue-600">{stats.totalAbstracts}</div>
                  <div className="text-xs text-gray-600">Abstracts</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-orange-600">{stats.extractedEntities}</div>
                  <div className="text-xs text-gray-600">Entities</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-lg font-semibold text-green-600">{stats.totalKeywords}</div>
                  <div className="text-xs text-gray-600">Keywords</div>
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
                <h3 className="font-medium text-gray-900 mb-3">Node Details</h3>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${selectedNode.type === 'abstract' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                    <h4 className="font-medium text-sm">{selectedNode.label}</h4>
                  </div>
                  
                  {selectedNode.type === 'abstract' ? (
                    <div className="text-xs text-gray-600">
                      <p>This is the central abstract node that connects to all extracted entities.</p>
                    </div>
                  ) : selectedNode.entityData && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium">Types:</span> {selectedNode.entityData.types.join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span> {(selectedNode.entityData.confidence * 100).toFixed(1)}%
                      </div>
                      {selectedNode.entityData.abstract && (
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="mt-1 text-gray-600">{selectedNode.entityData.abstract}</p>
                        </div>
                      )}
                      {selectedNode.entityData.uri && (
                        <div>
                          <span className="font-medium">URI:</span>
                          <a 
                            href={selectedNode.entityData.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {selectedNode.entityData.uri}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Instructions</h3>
                <div className="bg-white p-3 rounded border text-xs text-gray-600 space-y-2">
                  <p><strong>Click</strong> on nodes to view details</p>
                  <p><strong>Drag</strong> nodes to rearrange</p>
                  <p><strong>Scroll</strong> to zoom in/out</p>
                  <p><strong>Hover</strong> to highlight connections</p>
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