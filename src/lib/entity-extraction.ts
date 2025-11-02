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
  // Old institution name (for backward compatibility)
  'Northern Beaches Secondary College',
  'Beaches',
  'Secondary College',
  // Geographic places (should not be research entities)
  'Philippines',
  'Manila',
  'Cebu',
  'Davao',
  'Mindanao',
  'Luzon',
  'Visayas',
  'Quezon City',
  'Makati',
  'Pasig',
  'Taguig',
  'United States',
  'USA',
  'America',
  'Europe',
  'Asia',
  'Africa',
  'Australia',
  'China',
  'Japan',
  'Korea',
  'Singapore',
  'Malaysia',
  'Indonesia',
  'Thailand',
  'Vietnam',
  'India',
  'City',
  'Town',
  'Province',
  'Region',
  'Country',
  'Municipality',
  'Barangay',
  // Generic terms
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
  'Reductionism',
  'Research',
  'Design',
  'User-centered Design',
  'User-Centered Design',
  'Methodology',
  'System', // Too generic, use specific system types instead
  'Secondary Education', // Redundant, covered by broader "Education" category
  'World Wide Web', // Too generic/ubiquitous
  'WWW', // Too generic/ubiquitous
  'Web' // Too generic without context
];

// Entity normalization and mapping rules
const ENTITY_MAPPINGS: { [key: string]: { term: string; category: 'technology' | 'domain' | 'methodology' } } = {
  // Map partial/generic terms to specific full terms in correct categories
  'information management': { term: 'Information Management System', category: 'technology' },
  'document management': { term: 'Document Management System', category: 'technology' },
  'electronic health record': { term: 'Electronic Health Record System', category: 'technology' },
  'agile': { term: 'Agile Software Development', category: 'methodology' },
  'agile software': { term: 'Agile Software Development', category: 'methodology' },
  'software development': { term: 'Agile Software Development', category: 'methodology' },
  'operations': { term: 'Operations Research', category: 'domain' },
  'operations research': { term: 'Operations Research', category: 'domain' },
  'data collection': { term: 'Data Collection', category: 'methodology' },
  'data collection method': { term: 'Data Collection', category: 'methodology' },
  'implementation': { term: 'Implementation', category: 'methodology' },
  'implementation process': { term: 'Implementation', category: 'methodology' },
  'irrigation': { term: 'Agriculture', category: 'domain' }, // Map to broader domain
  'irrigation system': { term: 'Irrigation Management System', category: 'technology' },
  // Institution name mappings (keep as research focus area)
  'northern bukidnon state college': { term: 'Northern Bukidnon State College', category: 'domain' },
  'nbsc': { term: 'NBSC', category: 'domain' },
  'nbsc campus': { term: 'NBSC Campus', category: 'domain' },
  // Misclassified terms that need proper categorization
  'software': { term: 'Software', category: 'technology' }, // Technical artifact/tool
  'geographic information system': { term: 'Geographic Information System', category: 'technology' }, // GIS is a software/system tool
  'agile software development': { term: 'Agile Software Development', category: 'methodology' }, // Process-oriented, not a technical artifact
  'software development process': { term: 'Agile Software Development', category: 'methodology' }, // Framework/process, not a tool
  'information': { term: 'Information Science', category: 'domain' }, // Conceptual knowledge area
  'educational technology': { term: 'Educational Technology', category: 'technology' }, // Actual tools/software/technical platforms
  'learning disability': { term: 'Learning Disability', category: 'domain' }, // Study area/conceptual topic
  'distance education': { term: 'Distance Education', category: 'domain' }, // Study area/conceptual topic
  'mobile app': { term: 'Mobile App', category: 'technology' }, // Actual tool/software/technical platform
  'management': { term: 'Management', category: 'domain' }, // Organizational or scientific study context
  'reliability engineering': { term: 'Reliability Engineering', category: 'domain' }, // Scientific study context
  'scientific method': { term: 'Scientific Method', category: 'methodology' }, // Procedural framework
  // Security and management terms
  'information security': { term: 'Information Security', category: 'domain' }, // Research study area, not a tool
  'data management': { term: 'Data Management', category: 'domain' }, // Research study area, not a specific system
  'records management': { term: 'Records Management', category: 'domain' }, // Research study area, not a specific system
  'web application': { term: 'Web Application', category: 'technology' }, // Implementation-based, keep as Technology only
  'computer security': { term: 'Computer Security', category: 'domain' }, // Research study area
  'security': { term: 'Security', category: 'domain' }, // Conceptual research area
  'computer': { term: 'Computer', category: 'domain' } // When standalone, usually refers to computer science/computing domain
};

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
  'Augmented Reality', 'Virtual Reality', 'VR', 'Smart Contracts',
  'API', 'Framework', 'Algorithm', 'Model', 'Platform',
  'Mobile App', 'Web Application', 'Database', 'SQL', 'NoSQL',
  'Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch',
  'Sensor', 'Network', 'Automation', 'Robotics', 'Drone', 'RFID', 'SMS',
  'Software', // Technical artifact/tool
  'Application Software', 'Ebook', 'Java', 'Android', 'Educational Technology', // Actual tools, software, or technical platforms
  'Automated Planning and Scheduling', 'User', 'Usability', 'System Integration', 'Technology', // Technical systems or engineering concepts
  'File Manager', 'Information Sensitivity', 'Computer Accessibility', 'Web Application', // Technical systems/programs
  // System Types (Technologies only)
  'Document Management System', 'Information Management System', 'Record Management System', 
  'Geographic Information System', 'Supply Management System', 'Inventory System', 
  'Reservation System', 'Booking System', 'Monitoring System', 'Notification System', 
  'Scheduling System', 'Queueing System', 'Interactive System', 'Decision Support System', 
  'Profiling System', 'Tracer System', 'Waste Management System', 'Management Information System',
  'Electronic Health Record System', 'Electronic Health Record', // Healthcare technology
  'Irrigation Management System' // Agriculture technology
];

// Domain keywords database
const DOMAIN_KEYWORDS = [
  'Agriculture', 'Precision Farming', 'Healthcare', 'Medical', 'Education',
  'E-Learning', 'Smart City', 'Urban Planning', 'Supply Chain', 'Logistics',
  'Finance', 'Banking', 'E-Commerce', 'Retail', 'Manufacturing',
  'Energy', 'Renewable Energy', 'Sustainability', 'Environment',
  'Transportation', 'Automotive', 'Security', 'Cybersecurity',
  'Social Media', 'Communication', 'Entertainment', 'Gaming',
  'Construction', 'Real Estate', 'Tourism', 'Hospitality', 'Livelihood',
  'Operations Research', // Scientific discipline focused on optimization
  'Information Science', // Conceptual knowledge area
  'Learning Disability', 'Distance Education', // Study areas/conceptual topics
  'Mental Health', 'Health Care', 'Healthcare', // Medical/health study areas
  'Reliability Engineering', // Scientific study context
  'Management', // Organizational or scientific study context
  'International Organization for Standardization', 'ISO', // Standards organization
  'Information Security', 'Computer Security', 'Security', // Security research study areas
  'Data Management', 'Records Management', // Management research study areas (not specific systems)
  'Computer', // Computer science/computing as a domain
  // Local geographic focus areas for research
  'Manolo Fortich', 'Municipality of Manolo Fortich',
  'Northern Mindanao', 'Bukidnon',
  'Alae', 'Barangay Alae', 'Alae Barangay Health Center',
  'Barangay Lingi-on', 'Lingion',
  'Barangay Maluko', 'Brgy. Maluko',
  'Barangay Puntian',
  'Communal Ranch and Tree Park',
  'Dahilayan Forest Park Resort',
  'District I', 'District II', 'District III', 'District IV',
  'Impasug-ong',
  'Kampo Juan', 'Kampo Juan Bukidnon',
  'Libona',
  'Manolo Fortich National High School',
  'Manolo Fortich MSWD Office',
  'St. Jude Thaddeus High School',
  'Northern Bukidnon State College', 'NBSC', 'NBSC Campus', // Institution as research focus area
  'Sumilao',
  'Tankulan'
];

// Methodology keywords database
const METHODOLOGY_KEYWORDS = [
  'Agile Software Development', 'Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning',
  'Classification', 'Regression', 'Clustering', 'Optimization',
  'Simulation', 'Modeling', 'Analysis', 'Survey', 'Experiment',
  'Case Study', 'Comparative Study', 'Literature Review',
  'Qualitative Research', 'Quantitative Research', 'Mixed Methods',
  'Data Collection', 'Evaluation', 'Testing', 'Validation',
  'Implementation', // Applied step or process for putting research into practice
  'Scientific Method' // Core research process
];

/**
 * Extract entities from text using keyword matching with intelligent mapping
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
 * Normalize and map extracted entities to their correct forms
 * This prevents duplicates by mapping partial/generic terms to specific ones
 */
function normalizeExtractedEntities(
  text: string,
  extractedTech: string[],
  extractedDomains: string[],
  extractedMethods: string[]
): { technologies: string[]; domains: string[]; methodologies: string[] } {
  const lowerText = text.toLowerCase();
  const finalTech = new Set<string>(extractedTech);
  const finalDomains = new Set<string>(extractedDomains);
  const finalMethods = new Set<string>(extractedMethods);

  // Check for mapped terms in the text and add to correct category
  Object.entries(ENTITY_MAPPINGS).forEach(([key, mapping]) => {
    if (lowerText.includes(key)) {
      // Remove any existing occurrences from wrong categories
      finalTech.delete(mapping.term);
      finalDomains.delete(mapping.term);
      finalMethods.delete(mapping.term);
      
      // Add to correct category only
      if (mapping.category === 'technology') {
        finalTech.add(mapping.term);
      } else if (mapping.category === 'domain') {
        finalDomains.add(mapping.term);
      } else if (mapping.category === 'methodology') {
        finalMethods.add(mapping.term);
      }
    }
  });

  return {
    technologies: Array.from(finalTech),
    domains: Array.from(finalDomains),
    methodologies: Array.from(finalMethods)
  };
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

  // Extract entities from each category (initial pass)
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

  // Normalize and map entities to prevent duplicates and ensure correct categorization
  const normalized = normalizeExtractedEntities(fullText, technologies, domains, methodologies);

  // Calculate confidence
  const confidence = calculateConfidence(
    normalized.technologies,
    normalized.domains,
    normalized.methodologies
  );

  return {
    technologies: normalized.technologies.slice(0, 8), // Limit to top 8
    domains: normalized.domains.slice(0, 6), // Limit to top 6
    methodologies: normalized.methodologies.slice(0, 5), // Limit to top 5
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
