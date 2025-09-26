import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, FileText, Users, Eye, Type, Image, CheckCircle } from 'lucide-react';

interface Entity {
  id: string;
  label: string;
  types: string[];
  confidence: number;
  abstract?: string;
  uri?: string;
}

interface DandelionResponse {
  annotations: Array<{
    id: number;
    start: number;
    end: number;
    spot: string;
    confidence: number;
    types?: string[];
    abstract?: string;
    uri?: string;
  }>;
}

interface OCRExtractorProps {
  onVisualizationData?: (data: { text: string; entities: Entity[] }) => void;
}

export const OCRExtractor: React.FC<OCRExtractorProps> = ({ onVisualizationData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [abstractText, setAbstractText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [extractionSource, setExtractionSource] = useState<'image' | 'text'>('image');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const extractEntitiesFromText = async (text: string): Promise<Entity[]> => {
    try {
      // Clean and preprocess the text
      const cleanedText = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .replace(/[^\w\s.,;:!?()\-'"]/g, '') // Remove special characters except basic punctuation
        .trim();

      console.log('🔍 Original text length:', text.length);
      console.log('🧹 Cleaned text length:', cleanedText.length);
      console.log('📝 Cleaned text preview:', cleanedText.substring(0, 200) + '...');
      
      if (cleanedText.length < 50) {
        console.warn('⚠️ Text too short for meaningful entity extraction');
        return [];
      }
      
      const response = await fetch('https://api.dandelion.eu/datatxt/nex/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: '58351b6744b145b68f1b4300fa390efc',
          text: cleanedText,
          include: 'types,abstract,uri',
          min_confidence: '0.4', // Lowered from 0.6 to catch more entities
          min_length: '2', // Minimum entity length
          social: 'false', // Disable social media entities for academic content
          lang: 'en' // Specify English language
        })
      });

      console.log('🌐 Dandelion API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dandelion API error:', response.status, errorText);
        throw new Error(`Dandelion API request failed: ${response.status} - ${errorText}`);
      }

      const data: DandelionResponse = await response.json();
      console.log('📋 Dandelion API response:', data);
      
      if (!data.annotations || data.annotations.length === 0) {
        console.warn('⚠️ No annotations found in API response');
        console.log('💡 Response data:', JSON.stringify(data, null, 2));
        return [];
      }

      const entities = data.annotations.map((annotation, index) => ({
        id: `entity-${index}`,
        label: annotation.spot,
        types: annotation.types || ['Unknown'],
        confidence: annotation.confidence,
        abstract: annotation.abstract,
        uri: annotation.uri
      }));

      console.log('✅ Extracted entities:', entities.length, 'found');
      return entities;
    } catch (error) {
      console.error('💥 Entity extraction failed:', error);
      return [];
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid file format: PNG, JPG, or PDF');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setExtractionSource('image');
    setOcrProgress(0);
    
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      setIsProcessing(false);
      setShowResults(true);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setIsProcessing(false);
      alert('Failed to extract text from image. Please try again.');
    }
  };

  const handleDemoExtraction = async () => {
    const demoText = `NBSC CITE Research Paper
  
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
and students.`;

    setIsProcessing(true);
    setExtractionSource('image');
    setExtractedText(demoText);
    
    try {
      const extractedEntities = await extractEntitiesFromText(demoText);
      setEntities(extractedEntities);
      setIsProcessing(false);
      setShowResults(true);
    } catch (error) {
      setIsProcessing(false);
      alert('Failed to extract entities. Please try again.');
    }
  };

  const handleTextExtraction = async () => {
    const textToProcess = extractedText || abstractText;
    if (!textToProcess.trim()) return;
    
    try {
      setIsProcessing(true);
      setExtractionSource('text');
      const extractedEntities = await extractEntitiesFromText(textToProcess);
      setEntities(extractedEntities);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing text:', error);
      alert('Failed to extract entities from text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Two-Pane Input Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-[500px]">
          {/* Left Pane - Image Upload */}
          <div className="p-6 border-r border-gray-200 lg:col-span-1">
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
                    {selectedFile ? `Processing OCR... ${ocrProgress}%` : 'Extracting Entities...'}
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Try Demo Extraction
                  </>
                )}
              </button>

              {/* Image preview */}
              {selectedFile && previewUrl ? (
                <div className="mt-6 border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {selectedFile.type.startsWith('image/') && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-48 rounded border mx-auto"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Supports JPG, PNG, PDF images
                  </p>
                </div>
              )}

              {/* OCR Success Message */}
              {extractedText && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-green-800 font-medium mb-2">Text Extracted Successfully!</h4>
                      <div className="text-sm text-green-700 mb-3">
                        <p>Extracted {extractedText.length} characters from your uploaded image.</p>
                        <p className="mt-1">You can now edit the text on the right panel before extracting entities.</p>
                      </div>
                      
                      <details className="mt-3">
                        <summary className="cursor-pointer text-green-800 font-medium hover:text-green-900">
                          View Extracted Text
                        </summary>
                        <div className="mt-2 p-3 bg-white border border-green-200 rounded text-sm text-gray-700 max-h-32 overflow-y-auto font-mono">
                          {extractedText}
                        </div>
                      </details>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => {
                            // Switch focus to the right panel by showing a subtle animation or scroll
                            const textarea = document.querySelector('textarea');
                            if (textarea) {
                              textarea.focus();
                              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                        >
                          Edit Text →
                        </button>
                        
                        <button
                          onClick={async () => {
                            if (!selectedFile) return;
                            setIsProcessing(true);
                            try {
                              const worker = await createWorker('eng');
                              const { data: { text } } = await worker.recognize(selectedFile);
                              await worker.terminate();
                              setExtractedText(text);
                            } catch (error) {
                              alert('Failed to re-extract text. Please try again.');
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="px-3 py-1.5 text-xs border border-green-600 text-green-700 hover:bg-green-50 rounded-md font-medium transition-colors"
                        >
                          Re-extract
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane - Text Input */}
          <div className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Type className="w-5 h-5 mr-2" />
              Abstract Text Extraction
            </h3>

            {/* Editing Tools */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">💡</div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Editing Tips for Better Entity Extraction:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Remove headers, footers, or page numbers</li>
                    <li>• Fix OCR errors and misspelled words</li>
                    <li>• Keep only the main abstract content</li>
                    <li>• Remove extra line breaks or formatting</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 h-full">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {extractedText ? 'Edit Extracted Text or Paste New Abstract' : 'Paste Abstract Text for Entity Extraction'}
                </label>
                <textarea
                  value={extractedText || abstractText}
                  onChange={(e) => {
                    if (extractedText) {
                      setExtractedText(e.target.value);
                    } else {
                      setAbstractText(e.target.value);
                    }
                  }}
                  placeholder="Paste your research abstract or text here for entity extraction..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  disabled={isProcessing}
                />
                
                {/* Character and word count */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    {(extractedText || abstractText).length} characters • {(extractedText || abstractText).split(' ').filter(w => w.trim()).length} words
                  </span>
                  {extractedText && (
                    <span className="text-blue-600 font-medium">✓ From OCR extraction</span>
                  )}
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {(extractedText || abstractText) && (
                  <button
                    onClick={() => {
                      setExtractedText('');
                      setAbstractText('');
                      setEntities([]);
                      setShowResults(false);
                    }}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                
                {selectedFile && extractedText && (
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        const worker = await createWorker('eng');
                        const { data: { text } } = await worker.recognize(selectedFile);
                        await worker.terminate();
                        setExtractedText(text);
                        setIsProcessing(false);
                      } catch (error) {
                        setIsProcessing(false);
                        alert('Failed to re-extract text. Please try again.');
                      }
                    }}
                    disabled={isProcessing}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Re-extract OCR
                  </button>
                )}

                <button
                  onClick={async () => {
                    // Test API with sample academic text
                    const testText = "Machine learning algorithms developed by researchers at Stanford University demonstrate significant improvements in natural language processing tasks using transformer architectures.";
                    setIsProcessing(true);
                    try {
                      const testEntities = await extractEntitiesFromText(testText);
                      if (testEntities.length > 0) {
                        alert(`✅ API Test Successful! Found ${testEntities.length} entities in test text.`);
                      } else {
                        alert('⚠️ API Test: No entities found in test text. Check console for details.');
                      }
                    } catch (error) {
                      alert('❌ API Test Failed: ' + error.message);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="px-3 py-2 text-xs border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Test API
                </button>

                <button
                  onClick={() => {
                    const textToProcess = extractedText || abstractText;
                    if (extractedText) {
                      handleTextExtraction();
                    } else {
                      handleTextExtraction();
                    }
                  }}
                  disabled={isProcessing || !(extractedText || abstractText).trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Extracting Entities...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      {extractedText ? 'Extract Entities from Edited Text' : 'Extract Entities from Text'}
                    </>
                  )}
                </button>
              </div>

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
                </div>
                <div className="bg-gray-50 p-4 rounded-md max-h-80 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {extractionSource === 'image' ? extractedText : abstractText}
                  </pre>
                </div>
              </div>

              {/* Identified Entities */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium text-gray-900">
                    Identified Entities ({entities.length})
                  </h5>
                  {entities.length > 0 && (
                    <button
                      onClick={() => {
                        const visualizationData = {
                          text: extractedText || abstractText || '',
                          entities: entities || []
                        };
                        onVisualizationData?.(visualizationData);
                      }}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Visualize
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {entities.map((entity) => (
                    <div
                      key={entity.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h6 className="font-medium text-gray-900 text-sm">{entity.label}</h6>
                          <p className="text-xs text-gray-600 mt-1">
                            {entity.types.join(', ')}
                          </p>
                          {entity.abstract && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {entity.abstract}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {(entity.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {entities.length === 0 && !isProcessing && showResults && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          No entities were extracted from the text
                        </p>
                        <div className="text-xs text-yellow-700 space-y-1">
                          <p className="font-medium">Try these improvements:</p>
                          <ul className="space-y-1 ml-4">
                            <li>• Use more specific academic terminology</li>
                            <li>• Include author names, institution names, or technical terms</li>
                            <li>• Add research methodologies or field-specific keywords</li>
                            <li>• Ensure text is at least 50-100 characters long</li>
                            <li>• Remove OCR artifacts like extra spaces or symbols</li>
                          </ul>
                          <p className="mt-2 font-medium">Check the browser console for detailed debugging info.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {entities.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h6 className="font-medium text-blue-900 mb-2 flex items-center text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ready for Visualization
                    </h6>
                    <p className="text-xs text-blue-700">
                      Click the "Visualize" button above to see an interactive force-directed graph 
                      showing relationships between entities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
