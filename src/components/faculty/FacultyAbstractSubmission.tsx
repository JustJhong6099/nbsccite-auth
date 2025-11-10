import React, { useState, useCallback, useRef } from 'react';
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
  AlertCircle,
  Camera,
  Scan,
  Loader2,
  Network,
  CheckCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Send,
  X,
  Edit2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Tesseract from 'tesseract.js';
import { performEntityExtraction, type ExtractedEntities } from '@/lib/dandelion-api';
import * as d3 from "d3";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { EntityEditor } from '../student/EntityEditor';

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

interface FacultyAbstractSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FacultyAbstractSubmission: React.FC<FacultyAbstractSubmissionProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
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
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  
  // Entity extraction states
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities | null>(null);
  const [isExtractingEntities, setIsExtractingEntities] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isEditingEntities, setIsEditingEntities] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

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
          if (!formData.abstract.trim()) {
            setFormData(prev => ({ ...prev, abstract: extractedText }));
            toast.success("Text extracted and added to abstract!");
          } else {
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
      // NOTE: Entities are kept in memory only, not saved to database
      // They will only be saved when the abstract is actually published
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

  const handleSaveEditedEntities = (updatedEntities: ExtractedEntities) => {
    setExtractedEntities(updatedEntities);
    setIsEditingEntities(false);
    
    // Rebuild visualization with updated entities
    setTimeout(() => {
      if (svgRef.current && updatedEntities) {
        buildEntityGraph(updatedEntities);
      }
    }, 100);
  };

  const handleCancelEditEntities = () => {
    setIsEditingEntities(false);
  };

  const buildEntityGraph = (entities: ExtractedEntities) => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 700;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const container = svg.append("g");

    const allEntities = [
      ...entities.technologies,
      ...entities.domains,
      ...entities.methodologies
    ];

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

    const links: Link[] = allEntities.map((_, index) => ({
      source: 'center',
      target: `entity-${index}`
    }));

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

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

    node.append("circle")
      .attr("r", (d) => d.type === 'center' ? 45 : 30)
      .attr("fill", (d) => d.type === 'center' ? "#3b82f6" : "#fb923c")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.type === 'center' ? 50 : 35)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))");
        
        link.style("stroke-opacity", (l: any) => 
          (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2
        )
        .style("stroke-width", (l: any) => 
          (l.source.id === d.id || l.target.id === d.id) ? 3 : 2
        );
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", (d: any) => d.type === 'center' ? 45 : 30)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
        
        link.style("stroke-opacity", 0.6)
          .style("stroke-width", 2);
      });

    node.append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.type === 'center' ? 60 : 45)
      .attr("font-size", (d) => d.type === 'center' ? "13px" : "11px")
      .attr("font-weight", (d) => d.type === 'center' ? "600" : "500")
      .attr("fill", "#374151")
      .style("pointer-events", "none")
      .style("user-select", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

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

  const handlePreview = async () => {
    if (!formData.title || !formData.abstract) {
      toast.error("Please fill in title and abstract first");
      return;
    }

    await handleExtractEntities();
    setShowPreviewModal(true);
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

    // Check for duplicate approved abstracts with the same title
    try {
      const { data: duplicates, error: duplicateError } = await supabase
        .from('abstracts')
        .select('id, title, authors, submitted_date')
        .eq('status', 'approved')
        .ilike('title', formData.title.trim());

      if (duplicateError) throw duplicateError;

      if (duplicates && duplicates.length > 0) {
        const duplicate = duplicates[0];
        toast.error(
          `This abstract title already exists in approved abstracts!\n\nTitle: "${duplicate.title}"\nSubmitted: ${new Date(duplicate.submitted_date).toLocaleDateString()}`,
          { duration: 6000 }
        );
        return;
      }
    } catch (error: any) {
      console.error('Duplicate check error:', error);
      toast.error("Error checking for duplicates. Please try again.");
      return;
    }

    if (!extractedEntities) {
      await handleExtractEntities();
    }

    setIsSubmitting(true);
    
    try {
      // Submit to Supabase with status 'approved' - entities are ONLY saved here upon actual publish
      const { data, error } = await supabase.from('abstracts').insert({
        student_id: user.id,
        title: formData.title,
        authors: formData.authors ? formData.authors.split(',').map(a => a.trim()).filter(a => a) : [],
        abstract_text: formData.abstract,
        keywords: formData.keywords,
        year: parseInt(formData.year),
        extracted_entities: extractedEntities, // Saved only on publish
        entity_extraction_confidence: extractedEntities?.confidence || 0,
        status: 'approved', // Auto-approve for faculty
        submitted_date: new Date().toISOString(),
        reviewed_date: new Date().toISOString(), // Set as reviewed immediately
        reviewed_by: user.id // Self-reviewed
      }).select();

      if (error) throw error;

      setIsSubmitting(false);
      setShowPreviewModal(false);
      toast.success("Abstract published successfully!");
      
      // Reset form and clear temporary entities
      setFormData({
        title: '',
        authors: '',
        abstract: '',
        keywords: [],
        year: '2025'
      });
      setExtractedEntities(null); // Clear extracted entities from memory
      setOcrImage(null);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to submit abstract");
      setIsSubmitting(false);
    }
  };

  // Cleanup function to clear extracted entities when modal is cancelled or closed
  const handleCancel = useCallback(() => {
    setExtractedEntities(null); // Clear temporary entities
    setShowPreviewModal(false);
    onClose();
    toast.info("Submission cancelled. Extracted entities discarded.");
  }, [onClose]);

  // Add cleanup on component unmount or when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      // Clear any temporary extracted entities when modal closes
      setExtractedEntities(null);
    }
  }, [isOpen]);

  return (
    <>
      {/* Main Form Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Abstract to Library</DialogTitle>
            <DialogDescription>
              Submit an abstract that will be automatically published to the approved abstracts library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Submission Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Faculty Submission</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Your abstract will be automatically approved and published to the library upon submission.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Pane - Abstract Content */}
              <div className="space-y-4">
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
                    className="mt-1 min-h-[200px]"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {formData.abstract.length} characters
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
                      <Button variant="outline" onClick={handleKeywordAdd} type="button">
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
                          {keyword} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane - OCR Upload */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Scan className="h-5 w-5" />
                      OCR Text Extraction
                    </CardTitle>
                    <CardDescription>Upload an image to extract text automatically</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          type="button"
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
                          type="button"
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isExtractingEntities || isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
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
                    Preview & Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Preview & Publish Abstract
            </DialogTitle>
            <DialogDescription>
              Review your abstract and extracted entities before publishing
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
                {!isEditingEntities ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Extracted Entities</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {Math.round(extractedEntities.confidence * 100)}% Confidence
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingEntities(true)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          type="button"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Entities
                        </Button>
                      </div>
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
                          type="button"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleZoomOut}
                          className="h-7 w-7 p-0"
                          title="Zoom Out"
                          type="button"
                        >
                          <ZoomOut className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleResetZoom}
                          className="h-7 w-7 p-0"
                          title="Reset View"
                          type="button"
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
                  </>
                ) : (
                  /* Entity Editor Mode */
                  <EntityEditor
                    entities={extractedEntities}
                    onSave={handleSaveEditedEntities}
                    onCancel={handleCancelEditEntities}
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowPreviewModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publish to Library
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
