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
  // Old institution name (for backward compatibility with existing data)
  'northern beaches secondary college',
  'beaches',
  'secondary college',
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
  'faculty'
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
    'data management', // Should be technology/methodology
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
    // Generic terms
    'technology', // Too generic when alone
    'accuracy and precision', // This is a metric
    'profiling', // This is a methodology/technique
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
    // Domains misclassified as methodologies  
    'education',
    'healthcare',
    'tourism',
    'agriculture',
  ]
};

// Replacement mappings for standardizing terminology
export const TERM_REPLACEMENTS: { [key: string]: string } = {
  // IoT variations
  'iot': 'Internet of Things',
  'i.o.t': 'Internet of Things',
  'i.o.t.': 'Internet of Things',
  
  // Map generic/partial terms to specific correct forms
  'information management': 'Information Management System',
  'document management': 'Document Management System',
  'electronic health record': 'Electronic Health Record System',
  'web application': 'Web Application',
  'agile': 'Agile Software Development',
  'agile software': 'Agile Software Development',
  'software development': 'Agile Software Development',
  'operations': 'Operations Research',
  'data collection': 'Data Collection',
  'data collection method': 'Data Collection',
  'implementation': 'Implementation',
  'implementation process': 'Implementation',
  'irrigation': 'Agriculture', // Map generic irrigation to agriculture domain
  'irrigation system': 'Irrigation Management System',
  // Misclassified terms
  'software': 'Software',
  'geographic information system': 'Geographic Information System',
  'gis': 'Geographic Information System',
  'agile software development': 'Agile Software Development',
  'software development process': 'Agile Software Development',
  'information': 'Information Science',
  'information science': 'Information Science',
  'educational technology': 'Educational Technology',
  'learning disability': 'Learning Disability',
  'distance education': 'Distance Education',
  'mobile app': 'Mobile App',
  'application software': 'Application Software',
  'ebook': 'Ebook',
  'e-book': 'Ebook',
  'java': 'Java',
  'android': 'Android',
  'automated planning and scheduling': 'Automated Planning and Scheduling',
  'user': 'User',
  'user computing': 'User',
  'usability': 'Usability',
  'system integration': 'System Integration',
  'technology': 'Technology',
  'mental health': 'Mental Health',
  'health care': 'Health Care',
  'healthcare': 'Health Care',
  'reliability engineering': 'Reliability Engineering',
  'management': 'Management',
  'international organization for standardization': 'International Organization for Standardization',
  'iso': 'ISO',
  'scientific method': 'Scientific Method',
  // Security and management research areas
  'information security': 'Information Security',
  'data management': 'Data Management',
  'records management': 'Records Management',
  'computer security': 'Computer Security',
  'security': 'Security',
  'computer': 'Computer',
  'file manager': 'File Manager',
  'information sensitivity': 'Information Sensitivity',
  'computer accessibility': 'Computer Accessibility',
  // Local geographic focus areas (normalize variations)
  'manolo fortich': 'Manolo Fortich',
  'municipality of manolo fortich': 'Manolo Fortich',
  'northern mindanao': 'Northern Mindanao',
  'bukidnon': 'Bukidnon',
  'alae': 'Alae',
  'barangay alae': 'Alae',
  'alae barangay health center': 'Alae Barangay Health Center',
  'barangay lingi-on': 'Barangay Lingi-on',
  'lingion': 'Barangay Lingi-on',
  'barangay maluko': 'Barangay Maluko',
  'brgy. maluko': 'Barangay Maluko',
  'brgy maluko': 'Barangay Maluko',
  'barangay puntian': 'Barangay Puntian',
  'communal ranch and tree park': 'Communal Ranch and Tree Park',
  'dahilayan forest park resort': 'Dahilayan Forest Park Resort',
  'district i': 'District I',
  'district ii': 'District II',
  'district iii': 'District III',
  'district iv': 'District IV',
  'impasug-ong': 'Impasug-ong',
  'kampo juan': 'Kampo Juan',
  'kampo juan bukidnon': 'Kampo Juan',
  'libona': 'Libona',
  'manolo fortich national high school': 'Manolo Fortich National High School',
  'manolo fortich mswd office': 'Manolo Fortich MSWD Office',
  'st. jude thaddeus high school': 'St. Jude Thaddeus High School',
  'st jude thaddeus high school': 'St. Jude Thaddeus High School',
  'northern bukidnon state college': 'Northern Bukidnon State College',
  'nbsc': 'NBSC',
  'nbsc campus': 'NBSC Campus',
  'sumilao': 'Sumilao',
  'tankulan': 'Tankulan',
  
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
