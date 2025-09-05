import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Camera,
  Scan,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Tesseract from 'tesseract.js';

interface AbstractFormData {
  title: string;
  abstract: string;
  keywords: string[];
  year: string;
  file?: File;
}

export const AbstractSubmission: React.FC = () => {
  const [formData, setFormData] = useState<AbstractFormData>({
    title: '',
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      toast.success(`File "${file.name}" uploaded successfully`);
    }
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

  const handleSaveDraft = () => {
    setIsDraft(true);
    setTimeout(() => {
      setIsDraft(false);
      toast.success("Draft saved successfully");
    }, 1000);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.abstract) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Abstract submitted for review!");
      // Reset form
      setFormData({
        title: '',
        abstract: '',
        keywords: [],
        year: '2025'
      });
      setOcrImage(null);
    }, 2000);
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

            {formData.file && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Attached File</Label>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{formData.file.name}</span>
                </div>
              </div>
            )}

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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the essential details about your research</CardDescription>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abstract Content</CardTitle>
              <CardDescription>Write your abstract or use OCR to extract text from an image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title || !formData.abstract} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

          <Card>
            <CardHeader>
              <CardTitle>File Upload (Optional)</CardTitle>
              <CardDescription>Upload your research paper or supporting documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Upload your research document
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supports PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              </div>
              {formData.file && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">File uploaded: {formData.file.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

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
        </div>
      </div>
    </div>
  );
};
