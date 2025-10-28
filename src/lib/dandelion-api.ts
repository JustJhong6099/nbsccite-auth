/**
 * Dandelion API Integration for Entity Extraction
 * More accurate and sophisticated entity recognition
 * https://dandelion.eu/docs/api/datatxt/nex/
 */

export interface DandelionEntity {
  id: string;
  title: string;
  uri: string;
  label: string;
  confidence: number;
  types: string[];
  categories?: string[];
  abstract?: string;
}

export interface DandelionResponse {
  time: number;
  annotations: DandelionEntity[];
  lang: string;
  timestamp: string;
}

export interface ExtractedEntities {
  technologies: string[];
  domains: string[];
  methodologies: string[];
  confidence: number;
  rawEntities?: DandelionEntity[]; // Keep raw data for reference
}

// Dandelion API Configuration
const DANDELION_API_URL = 'https://api.dandelion.eu/datatxt/nex/v1';
const DANDELION_TOKEN = import.meta.env.VITE_DANDELION_API_TOKEN || '';

console.log('🔑 Dandelion API Token Status:', DANDELION_TOKEN ? '✅ Token loaded' : '❌ Token missing');
console.log('🔑 Token length:', DANDELION_TOKEN.length, 'characters');

// Technology-related DBpedia types/categories
const TECHNOLOGY_TYPES = [
  'software',
  'programminglanguage',
  'algorithm',
  'device',
  'technology',
  'framework',
  'database',
  'protocol',
  'api',
  'webservice',
  'operatingsystem',
  'application',
  'mobileapp',
  'computerhardware',
  'sensor',
  'robot',
  'artificialintelligence',
  'machinelearning'
];

const TECHNOLOGY_KEYWORDS = [
  'machine learning', 'deep learning', 'neural network', 'artificial intelligence',
  'computer vision', 'natural language processing', 'nlp', 'blockchain', 'iot',
  'cloud computing', 'big data', 'data mining', 'virtual reality', 'vr',
  'augmented reality', 'ar', 'algorithm', 'framework', 'platform', 'system',
  'model', 'network', 'automation', 'robotics', 'sensor', 'web', 'mobile',
  'database', 'api', 'software', 'application', 'cnn', 'rnn', 'lstm',
  'tensorflow', 'pytorch', 'react', 'node', 'python', 'javascript',
  'monitoring', 'tracking', 'detection', 'recognition', 'prediction'
];

// Research domain types
const DOMAIN_TYPES = [
  'academicdiscipline',
  'field',
  'science',
  'industry',
  'organisation',
  'company',
  'researchinstitution',
  'educationalinstitution'
];

const DOMAIN_KEYWORDS = [
  'agriculture', 'farming', 'healthcare', 'medical', 'health', 'education', 
  'learning', 'finance', 'banking', 'transportation', 'transport',
  'energy', 'environment', 'environmental', 'security', 'cybersecurity',
  'manufacturing', 'construction', 'retail', 'ecommerce', 'e-commerce',
  'communication', 'entertainment', 'tourism', 'logistics', 'supply chain',
  'smart city', 'urban', 'business', 'management', 'marketing'
];

// Methodology types
const METHODOLOGY_KEYWORDS = [
  'supervised learning', 'unsupervised learning', 'reinforcement learning',
  'classification', 'regression', 'clustering', 'optimization',
  'simulation', 'modeling', 'modelling', 'analysis', 'survey', 'experiment',
  'case study', 'evaluation', 'testing', 'validation', 'implementation',
  'development', 'design', 'prototype', 'assessment', 'measurement'
];

/**
 * Call Dandelion API to extract entities
 */
async function callDandelionAPI(text: string): Promise<DandelionResponse | null> {
  console.log('🌐 Attempting to call Dandelion API...');
  console.log('🔑 Token available:', !!DANDELION_TOKEN);
  console.log('📝 Text length:', text.length);
  
  if (!DANDELION_TOKEN) {
    console.warn('⚠️ Dandelion API token not configured. Using fallback extraction.');
    return null;
  }

  try {
    const params = new URLSearchParams({
      text: text,
      token: DANDELION_TOKEN,
      confidence: '0.5', // Minimum confidence threshold (lowered for more results)
      lang: 'en',
      include: 'types,categories,abstract',
      social: 'false'
    });

    console.log('📡 Calling Dandelion API with URL:', `${DANDELION_API_URL}?${params.toString().substring(0, 100)}...`);
    
    const response = await fetch(`${DANDELION_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('📥 Dandelion API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Dandelion API error:', response.status, errorText);
      return null;
    }

    const data: DandelionResponse = await response.json();
    console.log('✅ Dandelion API Success! Found', data.annotations?.length || 0, 'entities');
    return data;
  } catch (error) {
    console.error('❌ Error calling Dandelion API:', error);
    return null;
  }
}

/**
 * Classify entity into technology, domain, or methodology
 */
function classifyEntity(entity: DandelionEntity, text: string): {
  isTechnology: boolean;
  isDomain: boolean;
  isMethodology: boolean;
} {
  const label = entity.label.toLowerCase();
  const title = entity.title?.toLowerCase() || '';
  const types = entity.types?.map(t => t.toLowerCase()) || [];
  const categories = entity.categories?.map(c => c.toLowerCase()) || [];
  const allText = `${label} ${title}`.toLowerCase();

  // Check if it's a technology (more flexible matching)
  const isTechnology = 
    types.some(type => TECHNOLOGY_TYPES.some(tt => type.includes(tt))) ||
    TECHNOLOGY_KEYWORDS.some(keyword => 
      allText.includes(keyword) || 
      keyword.includes(label) ||
      label.split(' ').some(word => keyword.includes(word) && word.length > 3)
    ) ||
    categories.some(cat => 
      cat.includes('technology') || 
      cat.includes('software') || 
      cat.includes('computing') ||
      cat.includes('computer science') ||
      cat.includes('information technology')
    );

  // Check if it's a domain (more flexible matching)
  const isDomain =
    types.some(type => DOMAIN_TYPES.some(dt => type.includes(dt))) ||
    DOMAIN_KEYWORDS.some(keyword => 
      allText.includes(keyword) || 
      keyword.includes(label) ||
      label.split(' ').some(word => keyword.includes(word) && word.length > 4)
    ) ||
    categories.some(cat => 
      cat.includes('industry') || 
      cat.includes('field') || 
      cat.includes('science') ||
      cat.includes('domain') ||
      cat.includes('sector')
    );

  // Check if it's a methodology (more flexible matching)
  const isMethodology =
    METHODOLOGY_KEYWORDS.some(keyword => 
      allText.includes(keyword) || 
      keyword.includes(label)
    ) ||
    categories.some(cat => 
      cat.includes('method') || 
      cat.includes('technique') ||
      cat.includes('approach')
    );

  return { isTechnology, isDomain, isMethodology };
}

/**
 * Filter out false positives and irrelevant entities
 */
function filterRelevantEntities(entities: DandelionEntity[], text: string): DandelionEntity[] {
  console.log('Filtering entities. Initial count:', entities.length);
  
  const filtered = entities.filter(entity => {
    const label = entity.label.toLowerCase();
    const title = entity.title?.toLowerCase() || '';
    
    // Filter out ONLY very common false positives
    const falsePositives = [
      'and', 'the', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were',
      'ar' // Filter out "AR" in all cases (too ambiguous)
    ];
    
    // Check if label is EXACTLY a false positive (not just contains it)
    if (falsePositives.includes(label)) {
      console.log('Filtered out false positive:', label);
      return false;
    }
    
    // Always filter out "ar" regardless of confidence or case
    if (label === 'ar') {
      console.log('Filtered out ambiguous "ar":', entity.label);
      return false;
    }
    
    // Filter out very short labels ONLY if low confidence
    if (label.length <= 2 && entity.confidence < 0.7) {
      console.log('Filtered out short low-confidence:', label, 'confidence:', entity.confidence);
      return false;
    }
    
    // Keep entities with decent confidence (lowered threshold)
    if (entity.confidence < 0.5) {
      console.log('Filtered out low confidence:', label, 'confidence:', entity.confidence);
      return false;
    }
    
    // Don't filter by classification here - let it through and classify later
    return true;
  });
  
  console.log('After filtering:', filtered.length, 'entities remain');
  return filtered;
}

/**
 * Fallback extraction using keyword matching (when Dandelion API is not available)
 */
function fallbackExtraction(text: string, keywords: string[]): ExtractedEntities {
  console.log('=== Fallback Extraction ===');
  const lowerText = text.toLowerCase();
  const fullText = `${text} ${keywords.join(' ')}`.toLowerCase();
  
  // Extract technologies
  const technologies = TECHNOLOGY_KEYWORDS.filter(tech => {
    const found = fullText.includes(tech);
    if (found) console.log('Found technology:', tech);
    return found;
  });
  
  // Extract domains
  const domains = DOMAIN_KEYWORDS.filter(domain => {
    const found = fullText.includes(domain);
    if (found) console.log('Found domain:', domain);
    return found;
  });
  
  // Extract methodologies
  const methodologies = METHODOLOGY_KEYWORDS.filter(method => {
    const found = fullText.includes(method);
    if (found) console.log('Found methodology:', method);
    return found;
  });
  
  // Also check user-provided keywords
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (TECHNOLOGY_KEYWORDS.some(t => t === lowerKeyword)) {
      if (!technologies.includes(keyword)) {
        technologies.push(keyword);
        console.log('Added technology from keywords:', keyword);
      }
    } else if (DOMAIN_KEYWORDS.some(d => d === lowerKeyword)) {
      if (!domains.includes(keyword)) {
        domains.push(keyword);
        console.log('Added domain from keywords:', keyword);
      }
    } else {
      // If keyword doesn't match any category, add to technologies by default
      if (!technologies.includes(keyword)) {
        technologies.push(keyword);
        console.log('Added keyword as technology:', keyword);
      }
    }
  });
  
  // Remove duplicates and capitalize
  const uniqueTechs = [...new Set(technologies)].map(t => 
    t.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  const uniqueDomains = [...new Set(domains)].map(d => 
    d.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  const uniqueMethodologies = [...new Set(methodologies)].map(m => 
    m.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  );
  
  const totalFound = uniqueTechs.length + uniqueDomains.length + uniqueMethodologies.length;
  const confidence = Math.min(0.7, 0.4 + (totalFound * 0.05)); // Lower confidence for fallback
  
  console.log('Fallback results - Tech:', uniqueTechs.length, 'Domains:', uniqueDomains.length, 'Methods:', uniqueMethodologies.length);
  console.log('Confidence:', confidence);
  
  return {
    technologies: uniqueTechs.slice(0, 8),
    domains: uniqueDomains.slice(0, 6),
    methodologies: uniqueMethodologies.slice(0, 5),
    confidence: Number(confidence.toFixed(2))
  };
}

/**
 * Main entity extraction function using Dandelion API
 * Falls back to keyword matching if API is unavailable
 */
export async function performEntityExtraction(
  abstractText: string,
  keywordsArray: string[]
): Promise<ExtractedEntities> {
  console.log('=== Starting Entity Extraction ===');
  console.log('Abstract length:', abstractText.length);
  console.log('Keywords provided:', keywordsArray);
  
  // Combine abstract text and keywords
  const fullText = `${abstractText} ${keywordsArray.join(' ')}`;
  
  // Try Dandelion API first
  const dandelionResponse = await callDandelionAPI(fullText);
  
  // Fallback if API not available or fails
  if (!dandelionResponse || !dandelionResponse.annotations) {
    console.log('Using fallback entity extraction (API not available)');
    return fallbackExtraction(abstractText, keywordsArray);
  }
  
  console.log(`Dandelion API found ${dandelionResponse.annotations.length} raw entities`);
  
  // Filter relevant entities
  const relevantEntities = filterRelevantEntities(dandelionResponse.annotations, fullText);
  console.log(`Filtered to ${relevantEntities.length} relevant entities`);
  
  // If no entities after filtering, use fallback
  if (relevantEntities.length === 0) {
    console.log('No entities after filtering, using fallback extraction');
    return fallbackExtraction(abstractText, keywordsArray);
  }
  
  // Classify entities
  const technologies = new Set<string>();
  const domains = new Set<string>();
  const methodologies = new Set<string>();
  
  relevantEntities.forEach(entity => {
    const classification = classifyEntity(entity, fullText);
    const label = entity.title || entity.label;
    
    console.log(`Entity: "${label}" - Tech: ${classification.isTechnology}, Domain: ${classification.isDomain}, Method: ${classification.isMethodology}`);
    
    if (classification.isTechnology) {
      technologies.add(label);
    }
    if (classification.isDomain) {
      domains.add(label);
    }
    if (classification.isMethodology) {
      methodologies.add(label);
    }
  });
  
  console.log('Final counts - Technologies:', technologies.size, 'Domains:', domains.size, 'Methodologies:', methodologies.size);
  
  // If no entities classified, use fallback
  if (technologies.size === 0 && domains.size === 0 && methodologies.size === 0) {
    console.log('No entities classified, using fallback extraction');
    return fallbackExtraction(abstractText, keywordsArray);
  }
  
  // Calculate confidence based on Dandelion's entity confidence scores
  const avgConfidence = relevantEntities.length > 0
    ? relevantEntities.reduce((sum, e) => sum + e.confidence, 0) / relevantEntities.length
    : 0.5;
  
  console.log('Average confidence:', avgConfidence);
  
  return {
    technologies: Array.from(technologies).slice(0, 8),
    domains: Array.from(domains).slice(0, 6),
    methodologies: Array.from(methodologies).slice(0, 5),
    confidence: Number(Math.min(avgConfidence, 0.95).toFixed(2)),
    rawEntities: relevantEntities
  };
}

/**
 * Format extracted entities for display
 */
export function formatExtractedEntities(entities: ExtractedEntities): string {
  const parts: string[] = [];
  
  if (entities.technologies.length > 0) {
    parts.push(`Technologies: ${entities.technologies.join(', ')}`);
  }
  if (entities.domains.length > 0) {
    parts.push(`Domains: ${entities.domains.join(', ')}`);
  }
  if (entities.methodologies.length > 0) {
    parts.push(`Methodologies: ${entities.methodologies.join(', ')}`);
  }
  
  return parts.join('\n');
}

/**
 * Get all unique entities as a flat array (for visualization)
 */
export function getAllEntities(entities: ExtractedEntities): string[] {
  return [
    ...entities.technologies,
    ...entities.domains,
    ...entities.methodologies
  ];
}
