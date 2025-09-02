import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-3 space-y-6">
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
              <CardDescription>Provide the detailed abstract of your research</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="abstract">Abstract Text *</Label>
                <Textarea
                  id="abstract"
                  placeholder="Write your research abstract here..."
                  value={formData.abstract}
                  onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  className="mt-1 min-h-[200px]"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Upload (Optional)</CardTitle>
              <CardDescription>Upload your research paper or supporting documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${formData.title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${formData.title ? 'text-green-700' : 'text-gray-500'}`}>
                  Title provided
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${formData.abstract ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${formData.abstract ? 'text-green-700' : 'text-gray-500'}`}>
                  Abstract written
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${formData.keywords.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${formData.keywords.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
                  Keywords added
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title || !formData.abstract}>
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
                  Save as Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
