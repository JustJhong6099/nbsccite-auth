import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Upload, 
  FileText, 
  Save, 
  Send, 
  AlertCircle,
  Eye,
  Camera,
  Scan,
  Loader2,
  Network,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Tesseract from 'tesseract.js';
import { performEntityExtraction, type ExtractedEntities } from '@/lib/dandelion-api';
import * as d3 from "d3";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface AbstractFormData {
  title: string;
  authors: string;
  abstract: string;
  keywords: string[];
  year: string;
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

export const AbstractSubmission: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AbstractFormData>({
    title: '',
    authors: '',
    abstract: '',
    keywords: [],
    year: '2025'
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  
  // Entity extraction states
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities | null>(null);
  const [isExtractingEntities, setIsExtractingEntities] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const simulationRef = React.useRef<d3.Simulation<Node, Link> | null>(null);
  const zoomBehaviorRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setOcrImage(imageUrl);
      setIsProcessingOCR(true);
      setOcrProgress(0);

      try {
        const result = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });

        const extractedText = result.data.text.trim();
        if (extractedText) {
          // If abstract is empty, fill it with OCR text
          if (!formData.abstract.trim()) {
            setFormData(prev => ({ ...prev, abstract: extractedText }));
            toast.success("Text extracted and added to abstract!");
          } else {
            // Ask user if they want to append or replace
            const append = window.confirm("Abstract already has content. Would you like to append the extracted text? (Cancel to replace)");
            if (append) {
              setFormData(prev => ({ ...prev, abstract: prev.abstract + '\n\n' + extractedText }));
              toast.success("Text extracted and appended to abstract!");
            } else {
              setFormData(prev => ({ ...prev, abstract: extractedText }));
              toast.success("Text extracted and replaced abstract content!");
            }
          }
        } else {
          toast.error("No text could be extracted from the image");
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error("Failed to extract text from image");
      } finally {
        setIsProcessingOCR(false);
        setOcrProgress(0);
      }
    } else {
      toast.error("Please select a valid image file");
    }
  }, [formData.abstract]);

  const handleExtractEntities = useCallback(async () => {
    if (!formData.abstract.trim()) {
      toast.error("Please enter abstract content first");
      return;
    }

    setIsExtractingEntities(true);
    try {
      // Perform entity extraction using Dandelion API
      const entities = await performEntityExtraction(formData.abstract, formData.keywords);
      setExtractedEntities(entities);
      
      // Build visualization
      setTimeout(() => {
        if (svgRef.current && entities) {
          buildEntityGraph(entities);
        }
      }, 100);
      
      toast.success(`Extracted ${entities.technologies.length + entities.domains.length + entities.methodologies.length} entities with ${Math.round(entities.confidence * 100)}% confidence`);
    } catch (error) {
      console.error('Entity extraction error:', error);
      toast.error("Failed to extract entities");
    } finally {
      setIsExtractingEntities(false);
    }
  }, [formData.abstract, formData.keywords]);

  const buildEntityGraph = (entities: ExtractedEntities) => {
    if (!svgRef.current) return;

    // Clear previous graph
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

    // Get all entities
    const allEntities = [
      ...entities.technologies,
      ...entities.domains,
      ...entities.methodologies
    ];

    // Create nodes: 1 center node + entity nodes
    const nodes: Node[] = [
      { id: 'center', label: 'Abstract Center', type: 'center', x: width / 2, y: height / 2 }
    ];

    allEntities.forEach((entity, index) => {
      nodes.push({
        id: `entity-${index}`,
        label: entity,
        type: 'entity'
      });
    });

    // Create links from center to entities
    const links: Link[] = allEntities.map((_, index) => ({
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
  };

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    setTimeout(() => {
      setIsDraft(false);
      toast.success("Draft saved successfully");
    }, 1000);
  };

  const handlePreview = async () => {
    if (!formData.title || !formData.abstract) {
      toast.error("Please fill in title and abstract first");
      return;
    }

    // Extract entities before showing preview
    await handleExtractEntities();
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.abstract) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit an abstract");
      return;
    }

    // Extract entities if not already done
    if (!extractedEntities) {
      await handleExtractEntities();
    }

    setIsSubmitting(true);
    
    try {
      // Submit to Supabase
      const { data, error } = await supabase.from('abstracts').insert({
        student_id: user.id,
        title: formData.title,
        authors: formData.authors ? formData.authors.split(',').map(a => a.trim()).filter(a => a) : [],
        abstract_text: formData.abstract,
        keywords: formData.keywords,
        year: parseInt(formData.year),
        extracted_entities: extractedEntities,
        entity_extraction_confidence: extractedEntities?.confidence || 0,
        status: 'pending',
        submitted_date: new Date().toISOString()
      }).select();

      if (error) throw error;

      setIsSubmitting(false);
      setShowSubmitModal(false);
      toast.success("Abstract submitted for review!");
      
      // Reset form
      setFormData({
        title: '',
        authors: '',
        abstract: '',
        keywords: [],
        year: '2025'
      });
      setExtractedEntities(null);
      setOcrImage(null);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to submit abstract");
      setIsSubmitting(false);
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Abstract Preview</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <FileText className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{formData.title || "Untitled Abstract"}</CardTitle>
            <CardDescription>
              {formData.authors && <span>{formData.authors} • </span>}
              {formData.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Abstract</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {formData.abstract || "No abstract content provided."}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Keywords</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    {keyword}
                  </Badge>
                ))}
                {formData.keywords.length === 0 && (
                  <span className="text-sm text-gray-500">No keywords added.</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
                {isDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit Research Abstract</h2>
          <p className="text-gray-600">Share your research work with the NBSC-ICS community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Submission Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Submission Guidelines</h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Abstract should be maximum 500 words</li>
                <li>• Ensure your research falls within 2020-2025 timeframe</li>
                <li>• Abstracts will undergo peer review before publication</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Pane - Abstract Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abstract Submission</CardTitle>
              <CardDescription>Provide your research details and abstract content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Research Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your research title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="authors">Authors</Label>
                <Input
                  id="authors"
                  placeholder="Enter author names (e.g., John Doe, Jane Smith, Dr. Brown)"
                  value={formData.authors}
                  onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple authors with commas
                </p>
              </div>

              <div>
                <Label htmlFor="year">Research Year</Label>
                <Select value={formData.year} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, year: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="abstract">Abstract Text *</Label>
                <Textarea
                  id="abstract"
                  placeholder="Write your research abstract here or use the OCR feature to extract text from an image..."
                  value={formData.abstract}
                  onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  className="mt-1 min-h-[300px]"
                />
                <div className="mt-1 text-sm text-gray-500">
                  {formData.abstract.length}/500 words maximum
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a keyword..."
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleKeywordAdd())}
                    />
                    <Button variant="outline" onClick={handleKeywordAdd}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => handleKeywordRemove(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handlePreview} 
                  disabled={isExtractingEntities || !formData.title || !formData.abstract} 
                  className="flex-1"
                >
                  {isExtractingEntities ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting Entities...
                    </>
                  ) : (
                    <>
                      <Network className="h-4 w-4 mr-2" />
                      Extract & Preview
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} disabled={isDraft}>
                  {isDraft ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Pane - OCR Picture Upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                OCR Text Extraction
              </CardTitle>
              <CardDescription>Upload an image containing text to automatically extract and add to your abstract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OCR Usage Tips */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">OCR Tips</h4>
                      <ul className="mt-2 text-xs text-blue-800 space-y-1">
                        <li>• Use clear, high-resolution images</li>
                        <li>• Ensure good contrast between text and background</li>
                        <li>• Avoid blurry or skewed images</li>
                        <li>• Review extracted text for accuracy</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Upload an image with text to extract
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={isProcessingOCR}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isProcessingOCR}
                  >
                    {isProcessingOCR ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>

              {isProcessingOCR && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Extracting text...</span>
                    <span>{ocrProgress}%</span>
                  </div>
                  <Progress value={ocrProgress} className="w-full" />
                </div>
              )}

              {ocrImage && (
                <div className="space-y-3">
                  <Label>Uploaded Image Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={ocrImage} 
                      alt="OCR Preview" 
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setOcrImage(null);
                      URL.revokeObjectURL(ocrImage);
                    }}
                    className="w-full"
                  >
                    Remove Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Preview Modal with Entity Extraction */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Preview & Submit Abstract
            </DialogTitle>
            <DialogDescription>
              Review your abstract and extracted entities before final submission
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Abstract Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{formData.title}</h3>
                {formData.authors && (
                  <p className="text-sm text-gray-600 mt-1">{formData.authors} • {formData.year}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Abstract</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.abstract}
                  </p>
                </div>
              </div>

              {formData.keywords.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Keywords</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Entities */}
            {extractedEntities && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Extracted Entities</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {Math.round(extractedEntities.confidence * 100)}% Confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Technologies */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                      Technologies
                    </Label>
                    <div className="mt-2 space-y-1">
                      {extractedEntities.technologies.length > 0 ? (
                        extractedEntities.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 mr-2 mb-2">
                            {tech}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None detected</p>
                      )}
                    </div>
                  </div>

                  {/* Research Domains */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                      Research Domains
                    </Label>
                    <div className="mt-2 space-y-1">
                      {extractedEntities.domains.length > 0 ? (
                        extractedEntities.domains.map((domain, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 mr-2 mb-2">
                            {domain}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None detected</p>
                      )}
                    </div>
                  </div>

                  {/* Methodologies */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-green-500"></span>
                      Methodologies
                    </Label>
                    <div className="mt-2 space-y-1">
                      {extractedEntities.methodologies.length > 0 ? (
                        extractedEntities.methodologies.map((method, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 mr-2 mb-2">
                            {method}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">None detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Entity Visualization */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-gray-700">Entity Relationship Graph</Label>
                    <div className="flex items-center gap-2">
                      {/* Legend */}
                      <div className="flex items-center gap-3 mr-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                          <span className="text-gray-600">Abstract Center</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#fb923c]"></div>
                          <span className="text-gray-600">Extracted Entities</span>
                        </div>
                      </div>
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 border rounded-md bg-white p-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleZoomIn}
                          className="h-7 w-7 p-0"
                          title="Zoom In"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleZoomOut}
                          className="h-7 w-7 p-0"
                          title="Zoom Out"
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleResetZoom}
                          className="h-7 w-7 p-0"
                          title="Reset View"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive Controls Text */}
                  <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                    <div className="text-xs text-blue-800 space-y-0.5">
                      <div className="font-semibold mb-1">Interactive Controls:</div>
                      <div>• <span className="font-medium">Drag nodes</span> to rearrange</div>
                      <div>• <span className="font-medium">Scroll wheel</span> to zoom</div>
                      <div>• <span className="font-medium">Click & drag background</span> to pan</div>
                      <div>• <span className="font-medium">Hover nodes</span> to highlight</div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-lg border overflow-hidden" style={{ height: '400px' }}>
                    <svg ref={svgRef} className="w-full h-full"></svg>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Confirm & Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
