/**
 * Entity Extraction Utility
 * Automatically extracts research entities from abstract text
 */

export interface ExtractedEntities {
  technologies: string[];
  domains: string[];
  methodologies: string[];
  confidence: number;
}

// False positives to exclude (institution names, common terms, etc.)
const FALSE_POSITIVES = [
  'Northern Beaches Secondary College',
  'School',
  'College',
  'University',
  'Institute',
  'Department',
  'Faculty',
  'Study',
  'Abstract',
  'Paper',
  'Student',
  'Teacher',
  'Professor',
  'Experience',
  'Document',
  'Experiment',
  'Reductionism'
];

// Helper function to check if entity is a false positive
function isFalsePositive(entity: string): boolean {
  const normalizedEntity = entity.trim().toLowerCase();
  return FALSE_POSITIVES.some(fp => 
    normalizedEntity === fp.toLowerCase() || 
    normalizedEntity.includes(fp.toLowerCase())
  );
}

// Technology keywords database
const TECHNOLOGY_KEYWORDS = [
  'Machine Learning', 'Deep Learning', 'Neural Networks', 'CNN', 'RNN', 'LSTM',
  'Artificial Intelligence', 'AI', 'Natural Language Processing', 'NLP',
  'Computer Vision', 'IoT', 'Internet of Things', 'Blockchain', 'Cloud Computing',
  'Big Data', 'Data Mining', 'Data Analytics', 'Predictive Analytics',
  'Augmented Reality', 'AR', 'Virtual Reality', 'VR', 'Smart Contracts',
  'API', 'Framework', 'Algorithm', 'Model', 'System', 'Platform',
  'Mobile App', 'Web Application', 'Database', 'SQL', 'NoSQL',
  'Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch',
  'Sensor', 'Network', 'Automation', 'Robotics', 'Drone'
];

// Domain keywords database
const DOMAIN_KEYWORDS = [
  'Agriculture', 'Precision Farming', 'Healthcare', 'Medical', 'Education',
  'E-Learning', 'Smart City', 'Urban Planning', 'Supply Chain', 'Logistics',
  'Finance', 'Banking', 'E-Commerce', 'Retail', 'Manufacturing',
  'Energy', 'Renewable Energy', 'Sustainability', 'Environment',
  'Transportation', 'Automotive', 'Security', 'Cybersecurity',
  'Social Media', 'Communication', 'Entertainment', 'Gaming',
  'Construction', 'Real Estate', 'Tourism', 'Hospitality'
];

// Methodology keywords database
const METHODOLOGY_KEYWORDS = [
  'Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning',
  'Classification', 'Regression', 'Clustering', 'Optimization',
  'Simulation', 'Modeling', 'Analysis', 'Survey', 'Experiment',
  'Case Study', 'Comparative Study', 'Literature Review',
  'Qualitative Research', 'Quantitative Research', 'Mixed Methods',
  'Data Collection', 'Evaluation', 'Testing', 'Validation'
];

/**
 * Extract entities from text using keyword matching
 */
export function extractEntities(text: string, keywords: string[]): string[] {
  const lowerText = text.toLowerCase();
  const found = new Set<string>();

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerText.includes(lowerKeyword) && !isFalsePositive(keyword)) {
      found.add(keyword);
    }
  });

  return Array.from(found);
}

/**
 * Calculate confidence score based on number of entities found
 */
function calculateConfidence(
  technologies: string[],
  domains: string[],
  methodologies: string[]
): number {
  const totalFound = technologies.length + domains.length + methodologies.length;
  
  // Base confidence on entity count
  if (totalFound >= 10) return 0.95;
  if (totalFound >= 7) return 0.85;
  if (totalFound >= 5) return 0.75;
  if (totalFound >= 3) return 0.65;
  return 0.50;
}

/**
 * Main entity extraction function
 * @param abstractText - The abstract text to analyze
 * @param keywordsArray - User-provided keywords
 * @returns Extracted entities with confidence score
 */
export function performEntityExtraction(
  abstractText: string,
  keywordsArray: string[]
): ExtractedEntities {
  // Combine abstract text and keywords for analysis
  const fullText = `${abstractText} ${keywordsArray.join(' ')}`;

  // Extract entities from each category
  const technologies = extractEntities(fullText, TECHNOLOGY_KEYWORDS);
  const domains = extractEntities(fullText, DOMAIN_KEYWORDS);
  const methodologies = extractEntities(fullText, METHODOLOGY_KEYWORDS);

  // Also include user keywords that match our categories
  keywordsArray.forEach(keyword => {
    // Skip false positives
    if (isFalsePositive(keyword)) return;
    
    if (TECHNOLOGY_KEYWORDS.some(tech => tech.toLowerCase() === keyword.toLowerCase())) {
      if (!technologies.includes(keyword)) {
        technologies.push(keyword);
      }
    }
    if (DOMAIN_KEYWORDS.some(domain => domain.toLowerCase() === keyword.toLowerCase())) {
      if (!domains.includes(keyword)) {
        domains.push(keyword);
      }
    }
  });

  // Calculate confidence
  const confidence = calculateConfidence(technologies, domains, methodologies);

  return {
    technologies: technologies.slice(0, 8), // Limit to top 8
    domains: domains.slice(0, 6), // Limit to top 6
    methodologies: methodologies.slice(0, 5), // Limit to top 5
    confidence: Number(confidence.toFixed(2))
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
