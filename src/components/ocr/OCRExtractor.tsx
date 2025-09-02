import React, { useState } from 'react';
import { Upload, FileText, Users, Eye, Type, Image } from 'lucide-react';

// Mock OCR result
const mockOCRResult = {
  text: `NBSC CITE Research Paper
  
Title: Advanced Machine Learning Applications in Educational Technology
Author: Dr. Maria Santos
Department: Computer Science
Date: August 2025

Abstract: This research explores the implementation of machine learning algorithms 
in educational platforms to enhance student learning outcomes. The study focuses 
on personalized learning paths, automated assessment systems, and predictive 
analytics for student performance.

Keywords: Machine Learning, Education Technology, Personalized Learning, 
Assessment Systems, Predictive Analytics

Methodology: The research employed a mixed-methods approach combining quantitative 
analysis of student performance data with qualitative feedback from educators 
and students.`,
  confidence: 0.94
};

// Mock entity extraction result
const mockEntities = [
  { id: '1', label: 'Machine Learning', type: 'Technology', confidence: 0.92 },
  { id: '2', label: 'Educational Technology', type: 'Field', confidence: 0.89 },
  { id: '3', label: 'Dr. Maria Santos', type: 'Person', confidence: 0.96 },
  { id: '4', label: 'Computer Science', type: 'Department', confidence: 0.91 },
  { id: '5', label: 'NBSC CITE', type: 'Organization', confidence: 0.95 },
];

export const OCRExtractor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [abstractText, setAbstractText] = useState('');
  const [extractionSource, setExtractionSource] = useState<'image' | 'text'>('image');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setExtractionSource('image');
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  const handleDemoExtraction = () => {
    setIsProcessing(true);
    setExtractionSource('image');
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 1500);
  };

  const handleTextExtraction = () => {
    if (!abstractText.trim()) return;
    
    setIsProcessing(true);
    setExtractionSource('text');
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowResults(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Two-Pane Input Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]">
          {/* Left Pane - Image Upload */}
          <div className="p-6 border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              OCR & Entity Extraction
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image for Text Extraction
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isProcessing}
                />
              </div>
              
              <div className="text-center">
                <span className="text-gray-500 text-sm">or</span>
              </div>
              
              <button
                onClick={handleDemoExtraction}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
              >
                {isProcessing && extractionSource === 'image' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Image...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Try Demo Extraction
                  </>
                )}
              </button>

              {/* Image preview placeholder */}
              <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Drag and drop an image here, or click to select
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Supports JPG, PNG, PDF images
                </p>
              </div>
            </div>
          </div>

          {/* Right Pane - Text Input */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Abstract Text Extraction
            </h3>
            
            <div className="space-y-4 h-full">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Abstract Text for Entity Extraction
                </label>
                <textarea
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  placeholder="Paste your research abstract or text here for entity extraction..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isProcessing}
                />
              </div>
              
              <button
                onClick={handleTextExtraction}
                disabled={isProcessing || !abstractText.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
              >
                {isProcessing && extractionSource === 'text' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Extracting Entities...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Extract Entities from Text
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 mt-2">
                <p>• Identifies research entities like authors, institutions, technologies</p>
                <p>• Extracts keywords and research domains</p>
                <p>• Analyzes methodology and findings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {extractionSource === 'image' ? 'OCR & Entity Extraction Results' : 'Entity Extraction Results'}
            </h4>
            
            {/* Results Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Extracted Text/Source */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium text-gray-900">
                    {extractionSource === 'image' ? 'Extracted Text' : 'Source Text'}
                  </h5>
                  {extractionSource === 'image' && (
                    <span className="text-sm text-gray-500">
                      Confidence: {(mockOCRResult.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md max-h-80 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {extractionSource === 'image' ? mockOCRResult.text : abstractText}
                  </pre>
                </div>
              </div>

              {/* Identified Entities */}
              <div>
                <h5 className="font-medium text-gray-900 mb-4">
                  Identified Entities ({mockEntities.length})
                </h5>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {mockEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-medium text-gray-900 text-sm">{entity.label}</h6>
                          <p className="text-xs text-gray-600 mt-1">{entity.type}</p>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {(entity.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h6 className="font-medium text-blue-900 mb-2 flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Entity Visualization
                  </h6>
                  <p className="text-xs text-blue-700">
                    Interactive graph visualization will show relationships between entities 
                    with force-directed layout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
