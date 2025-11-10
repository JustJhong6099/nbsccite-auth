/**
 * Data normalization utilities for research domains, keywords, and entities
 * Provides consistent filtering and replacement across all components
 */

// False positive terms to exclude from domain/keyword analysis
export const FALSE_POSITIVES = [
  'experience',
  'document',
  'experiment',
  'reductionism',
  'research',
  'design',
  'user-centered design',
  'methodology',
  'system', // Too generic, use specific system types instead
  'secondary education', // Redundant, covered by broader "Education" category
  'world wide web', // Too generic/ubiquitous
  'www', // Too generic/ubiquitous
  'web', // Too generic without context
  'internet', // Too generic/ubiquitous infrastructure
  'technology', // Too generic when alone
  
  // Institution names - NOT research domains
  'northern bukidnon state college',
  'bukidnon state college',
  'nbsc',
  'nbsc-ics',
  'state college',
  'college',
  'university',
  'institution',
  'school',
  
  // Too generic/vague concepts
  'concept',
  'time',
  'process',
  'method',
  'approach',
  'technique',
  'strategy',
  'model',
  'framework',
  'principle',
  'theory',
  
  // Performance metrics - NOT technologies
  'usability',
  'accuracy',
  'precision',
  'accuracy and precision',
  'performance',
  'efficiency',
  'effectiveness',
  'reliability',
  'validity',
  
  // Geographic places (should not be research entities)
  'philippines',
  'manila',
  'cebu',
  'davao',
  'mindanao',
  'luzon',
  'visayas',
  'quezon city',
  'makati',
  'pasig',
  'taguig',
  'manolo fortich',
  'bukidnon',
  'valencia',
  'malaybalay',
  'united states',
  'usa',
  'america',
  'europe',
  'asia',
  'africa',
  'australia',
  'china',
  'japan',
  'korea',
  'singapore',
  'malaysia',
  'indonesia',
  'thailand',
  'vietnam',
  'india',
  'city',
  'town',
  'province',
  'region',
  'country',
  'municipality',
  'barangay',
  
  // Old institution name (for backward compatibility)
  'northern beaches secondary college',
  'beaches',
  'secondary college',
  
  // Common words
  'the',
  'and',
  'or',
  'with',
  'for',
  'in',
  'on',
  'at',
  'to',
  'of',
  'study',
  'abstract',
  'paper',
  'student',
  'teacher',
  'professor',
  'faculty',
  'development', // Too generic alone
  'management', // Too generic alone
  'analysis', // Too generic alone
  'monitoring', // Too generic alone
];

// Terms that should NOT appear in specific categories
export const MISPLACED_TERMS = {
  domains: [
    // Technologies misclassified as domains
    'web-based',
    'web based',
    'mobile',
    'mobile app',
    'mobile application',
    'real-time',
    'real time',
    'virtual reality',
    'vr',
    'augmented reality',
    'ar',
    'cloud computing',
    'cloud',
    'internet of things',
    'iot',
    'artificial intelligence',
    'ai',
    'machine learning',
    'ml',
    'technology', // Too generic
    'web application',
    'web app',
    'software',
    'application',
    'system',
    'prototype',
    'algorithm',
    'database',
    'programming',
    'internet', // Infrastructure, not domain
    'php',
    'javascript',
    'python',
    'java',
    
    // Methodologies misclassified as domains
    'agile software development',
    'prototype',
    'data analysis',
    'evaluation',
    'profiling',
    
    // Metrics/principles - NOT domains
    'usability',
    'accuracy and precision',
    'efficiency',
    
    // Too generic/vague
    'concept',
    'time',
    'data management', // Too broad - needs specific context
    'reforestation', // Better as environmental science subdomain
    
    // Institution names - NOT domains
    'northern bukidnon state college',
    'bukidnon state college',
    'nbsc',
  ],
  technologies: [
    // Domains misclassified as technologies
    'education',
    'educational',
    'healthcare',
    'health care',
    'tourism',
    'agriculture',
    'business',
    'finance',
    'marketing',
    'human resource',
    'hr',
    'library',
    'medical',
    'nursing',
    'engineering',
    'architecture',
    'law',
    'psychology',
    'sociology',
    'computer security', // This is a domain
    'information systems', // This is a domain
    'information system', // This is a domain
    'data management', // Better as methodology or domain
    
    // Methodologies misclassified as technologies
    'agile',
    'waterfall',
    'scrum',
    'prototype',
    'prototyping',
    'data analysis',
    'statistical analysis',
    'survey',
    'interview',
    'case study',
    'evaluation',
    'assessment',
    'testing',
    'monitoring',
    'surveillance',
    'environmental monitoring', // This is a process/application
    'reforestation', // This is a topic/goal, not a technology
    'sustainable development', // This is a principle/goal
    'conservation development', // This is a principle/goal
    
    // Performance metrics - NOT technologies
    'usability',
    'accuracy',
    'precision',
    'accuracy and precision',
    'performance',
    'efficiency',
    
    // Generic/vague terms
    'technology', // Too generic when alone
    'internet', // Infrastructure, not specific tech
    'web', // Too generic
    'concept',
    'time',
  ],
  methodologies: [
    // Technologies misclassified as methodologies
    'web application',
    'web app',
    'mobile app',
    'mobile application',
    'database',
    'software',
    'system',
    'java',
    'python',
    'javascript',
    'php',
    'mysql',
    'react',
    'angular',
    'vue',
    'node',
    'nodejs',
    'internet',
    'technology',
    'real-time computing',
    'cross-platform software',
    'algorithmic efficiency',
    'computer accessibility',
    'web mapping',
    'application software',
    
    // Domains misclassified as methodologies  
    'education',
    'healthcare',
    'tourism',
    'agriculture',
    'information science',
    'computer security',
    'internet of things',
    'data management',
    'business operations',
    'business process',
    'environmental science', // This is a research domain, not a methodology
    'natural environment',
    
    // Principles/goals - NOT methodologies
    'sustainable development',
    'conservation development',
    'environmental monitoring', // Process, not a method
    'reforestation', // Topic/application
    
    // Too generic
    'concept',
    'time',
    'analysis', // Need specific type
    'monitoring', // Need specific method
    'development', // Need specific method
  ]
};

// Replacement mappings for standardizing terminology
export const TERM_REPLACEMENTS: { [key: string]: string } = {
  // IoT variations
  'iot': 'Internet of Things',
  'i.o.t': 'Internet of Things',
  'i.o.t.': 'Internet of Things',
  
  // Web-related terms - normalize to consistent naming
  'web-based': 'Web-Based System',
  'web based': 'Web-Based System',
  'web application': 'Web Application',
  'web app': 'Web Application',
  'website': 'Web-Based System',
  'online platform': 'Web-Based System',
  'internet': 'Web-Based System', // Only when it appears alone
  
  // Mobile variations
  'mobile': 'Mobile Application',
  'mobile app': 'Mobile Application',
  'mobile application': 'Mobile Application',
  
  // Data-related terms
  'data analysis': 'Data Analysis',
  'data analytics': 'Data Analytics',
  'data management': 'Data Management',
  'data collection': 'Data Collection',
  'data collection method': 'Data Collection',
  'database': 'Database Management',
  
  // Software development methodologies
  'agile': 'Agile Software Development',
  'agile software': 'Agile Software Development',
  'agile software development': 'Agile Software Development',
  'software development': 'Software Development',
  'software development process': 'Software Development',
  'prototype': 'Prototyping',
  'prototyping': 'Prototyping',
  
  // Information systems
  'information management': 'Information Management System',
  'document management': 'Document Management System',
  'geographic information system': 'Geographic Information System',
  'gis': 'Geographic Information System',
  'information system': 'Information System',
  'information systems': 'Information System',
  
  // Education domain
  'education': 'Education',
  'educational': 'Education',
  'educational technology': 'Educational Technology',
  'e-learning': 'E-Learning',
  'elearning': 'E-Learning',
  'distance education': 'Distance Education',
  'learning disability': 'Special Education',
  
  // Healthcare domain
  'healthcare': 'Healthcare',
  'health care': 'Healthcare',
  'medical': 'Healthcare',
  'electronic health record': 'Electronic Health Record System',
  'patient management': 'Patient Management System',
  
  // Environmental/Conservation
  'environmental monitoring': 'Environmental Science',
  'reforestation': 'Environmental Science',
  'sustainable development': 'Environmental Science',
  'conservation development': 'Environmental Science',
  'natural environment': 'Environmental Science',
  
  // Technology terms
  'java': 'Java',
  'javascript': 'JavaScript',
  'php': 'PHP',
  'python': 'Python',
  'android': 'Android',
  'real-time computing': 'Real-Time System',
  'real-time': 'Real-Time System',
  'cross-platform software': 'Cross-Platform Development',
  
  // Correct capitalizations
  'ebook': 'E-Book',
  'e-book': 'E-Book',
  'user': 'User Interface',
  'user computing': 'User Interface',
  
  // Map overly specific to general domain
  'irrigation': 'Agriculture',
  'irrigation system': 'Agriculture',
  'operations': 'Operations Research',
  'business operations': 'Business Operations',
  'business process': 'Business Process Management',
  
  // Remove metrics/evaluations that slipped through
  'usability': '', // Empty string will be filtered out
  'accuracy': '',
  'precision': '',
  'accuracy and precision': '',
  'efficiency': '',
  'performance': '',
  
  // System types
  'system integration': 'System Integration',
  'automated planning and scheduling': 'Automated Scheduling',
  'application software': 'Software Application',
  
  // Additional normalizations
  'technology': 'Technology',
  'mental health': 'Mental Health',
  'reliability engineering': 'Reliability Engineering',
  'management': 'Management System',
  'international organization for standardization': 'ISO Standard',
  'iso': 'ISO Standard',
  'scientific method': 'Scientific Method',
  
  // Security and management research areas
  'information security': 'Information Security',
  'records management': 'Records Management',
  'computer security': 'Computer Security',
  'security': 'Security System',
  'computer': 'Computer Science',
  'file manager': 'File Management',
  'information sensitivity': 'Information Security',
  
  // Specific Management Systems (keep these as valid system types)
  'information management system': 'Information Management System',
  'ims': 'Information Management System',
  'knowledge management system': 'Knowledge Management System',
  'kms': 'Knowledge Management System',
  'academic management system': 'Academic Management System',
  'educational management system': 'Educational Management System',
  'human resource management system': 'Human Resource Management System',
  'hrms': 'Human Resource Management System',
  'hr management system': 'Human Resource Management System',
  'inventory management system': 'Inventory Management System',
  'asset management system': 'Asset Management System',
  'service management system': 'Service Management System',
  'event management system': 'Event Management System',
  'ems': 'Event Management System',
  'project management system': 'Project Management System',
  'pms': 'Project Management System',
  'database management system': 'Database Management System',
  'dbms': 'Database Management System',
  'electronic health record system': 'Electronic Health Record System',
  'ehr': 'Electronic Health Record System',
  'operations research': 'Operations Research',
};

/**
 * Normalizes a term by applying filters and replacements
 * @param term - The term to normalize
 * @param applyCapitalization - Whether to capitalize the term if no replacement is found
 * @returns The normalized term, or null if it should be filtered out
 */
export function normalizeTerm(term: string, applyCapitalization: boolean = true): string | null {
  if (!term) return null;
  
  const trimmed = term.trim();
  if (!trimmed) return null;
  
  const normalized = trimmed.toLowerCase();
  
  // Filter out short terms (2 characters or less)
  if (normalized.length <= 2) return null;
  
  // Filter out false positives (exact matches)
  if (FALSE_POSITIVES.includes(normalized)) return null;
  
  // Apply replacements
  if (TERM_REPLACEMENTS[normalized]) {
    return TERM_REPLACEMENTS[normalized];
  }
  
  // Return with original casing or capitalized
  return applyCapitalization ? capitalizeWords(trimmed) : trimmed;
}

/**
 * Capitalizes the first letter of each word
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalizes an array of terms, removing nulls and duplicates
 * @param terms - Array of terms to normalize
 * @param applyCapitalization - Whether to capitalize terms
 * @returns Normalized array of unique terms
 */
export function normalizeTerms(terms: string[], applyCapitalization: boolean = true): string[] {
  const normalized = new Map<string, string>();
  
  terms.forEach(term => {
    const result = normalizeTerm(term, applyCapitalization);
    if (result) {
      // Use lowercase as key to prevent duplicates like "Data Management" and "data management"
      const key = result.toLowerCase();
      normalized.set(key, result);
    }
  });
  
  return Array.from(normalized.values());
}

/**
 * Counts occurrences of normalized terms
 * @param terms - Array of terms to count
 * @returns Object with term counts
 */
export function countNormalizedTerms(terms: string[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {};
  
  terms.forEach(term => {
    const normalized = normalizeTerm(term, true);
    if (normalized) {
      counts[normalized] = (counts[normalized] || 0) + 1;
    }
  });
  
  return counts;
}

/**
 * Gets top N terms by count
 * @param counts - Term counts object
 * @param limit - Number of top terms to return
 * @returns Array of [term, count] tuples sorted by count descending
 */
export function getTopTerms(counts: { [key: string]: number }, limit: number): [string, number][] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

/**
 * Filters terms by category to remove misclassified items
 * @param term - The term to check
 * @param category - The category type ('domains' | 'technologies' | 'methodologies')
 * @returns true if the term belongs in this category, false if misplaced
 */
export function isTermValidForCategory(term: string, category: 'domains' | 'technologies' | 'methodologies'): boolean {
  if (!term) return false;
  
  const normalized = term.toLowerCase().trim();
  
  // Check if term is in the misplaced list for this category
  const misplacedList = MISPLACED_TERMS[category] || [];
  return !misplacedList.some(misplaced => 
    normalized === misplaced.toLowerCase() || 
    normalized.includes(misplaced.toLowerCase())
  );
}

/**
 * Gets top N terms by count, filtered by category
 * @param counts - Term counts object
 * @param limit - Number of top terms to return
 * @param category - The category to filter for
 * @returns Array of [term, count] tuples sorted by count descending, filtered for category
 */
export function getTopTermsByCategory(
  counts: { [key: string]: number }, 
  limit: number,
  category: 'domains' | 'technologies' | 'methodologies'
): [string, number][] {
  return Object.entries(counts)
    .filter(([term]) => isTermValidForCategory(term, category))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
