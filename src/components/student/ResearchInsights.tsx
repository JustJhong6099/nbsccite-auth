import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { normalizeTerm, FALSE_POSITIVES } from '@/lib/data-normalization';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Target,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Search,
  Filter
} from "lucide-react";

// Helper function to check if entity is a false positive (for backward compatibility)
const isFalsePositive = (entity: string): boolean => {
  const normalizedEntity = entity.trim().toLowerCase();
  return FALSE_POSITIVES.some(fp => 
    normalizedEntity === fp.toLowerCase() || 
    normalizedEntity.includes(fp.toLowerCase())
  );
};

// Interfaces for real-time data
interface ResearchTheme {
  id: string;
  theme: string;
  frequency: number;
  trend: 'up' | 'down' | 'stable';
  papers: string[];
  relatedDomains: string[];
  growth: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

interface TrendPeriod {
  period: string;
  topics: string[];
  totalPapers: number;
  dominantTheme: string;
}

interface EmergingTech {
  id: string;
  name: string;
  maturity: 'experimental' | 'emerging' | 'growing';
  adoption: number;
  potential: number;
  timeframe: string;
  category: string;
  description: string;
  keyTechnologies: string[];
  researchOpportunities: string[];
  challenges: string[];
  relatedPapers: number;
  papers?: Array<{
    id: string;
    title: string;
    authors: string;
    year: number;
    abstract?: string;
  }>;
}

// Mock data for research insights
const mockResearchThemes: ResearchTheme[] = [
  {
    id: 'ai-education',
    theme: 'AI in Educational Technology',
    frequency: 45,
    trend: 'up',
    papers: ['ML in Education', 'Smart Learning Systems', 'Adaptive Assessment'],
    relatedDomains: ['Machine Learning', 'Educational Technology', 'Data Analytics'],
    growth: '+15%',
    significance: 'high',
    description: 'Growing trend in applying AI techniques to enhance learning experiences and educational outcomes.'
  },
  {
    id: 'web-technologies',
    theme: 'Modern Web Development',
    frequency: 38,
    trend: 'up',
    papers: ['E-commerce Platform', 'Progressive Web Apps', 'Real-time Collaboration'],
    relatedDomains: ['Web Development', 'User Experience', 'Cloud Computing'],
    growth: '+8%',
    significance: 'high',
    description: 'Continuous evolution of web technologies and frameworks for building scalable applications.'
  },
  {
    id: 'data-systems',
    theme: 'Data Management & Analytics',
    frequency: 32,
    trend: 'stable',
    papers: ['DB Optimization', 'Data Pipeline Design', 'Analytics Dashboard'],
    relatedDomains: ['Database Systems', 'Big Data', 'Business Intelligence'],
    growth: '+2%',
    significance: 'medium',
    description: 'Steady focus on efficient data storage, processing, and visualization solutions.'
  },
  {
    id: 'mobile-health',
    theme: 'Mobile Health Applications',
    frequency: 28,
    trend: 'up',
    papers: ['Healthcare App', 'Telemedicine Platform', 'Health Monitoring'],
    relatedDomains: ['Mobile Development', 'Healthcare Technology', 'IoT'],
    growth: '+12%',
    significance: 'medium',
    description: 'Increasing interest in mobile solutions for healthcare delivery and patient monitoring.'
  },
  {
    id: 'cybersecurity',
    theme: 'Security & Privacy',
    frequency: 22,
    trend: 'up',
    papers: ['Secure Authentication', 'Privacy Frameworks', 'Threat Detection'],
    relatedDomains: ['Cybersecurity', 'Cryptography', 'Network Security'],
    growth: '+18%',
    significance: 'high',
    description: 'Critical focus on protecting digital assets and user privacy in modern applications.'
  },
  {
    id: 'legacy-systems',
    theme: 'Legacy System Modernization',
    frequency: 18,
    trend: 'down',
    papers: ['System Migration', 'Architecture Refactoring'],
    relatedDomains: ['Software Engineering', 'System Architecture'],
    growth: '-5%',
    significance: 'low',
    description: 'Declining interest as organizations complete their digital transformation initiatives.'
  }
];

const mockTrendAnalysis: TrendPeriod[] = [
  {
    period: '2020',
    topics: ['Web Development', 'Database Systems', 'Mobile Apps'],
    totalPapers: 45,
    dominantTheme: 'Traditional Software Development'
  },
  {
    period: '2021',
    topics: ['Machine Learning', 'Web Development', 'Cloud Computing'],
    totalPapers: 52,
    dominantTheme: 'AI Integration Begins'
  },
  {
    period: '2022',
    topics: ['AI/ML', 'Educational Technology', 'Data Science'],
    totalPapers: 68,
    dominantTheme: 'AI in Education Focus'
  },
  {
    period: '2023',
    topics: ['Educational AI', 'Modern Web', 'Healthcare Tech'],
    totalPapers: 78,
    dominantTheme: 'Specialized AI Applications'
  },
  {
    period: '2024',
    topics: ['Advanced AI', 'Mobile Health', 'Security'],
    totalPapers: 85,
    dominantTheme: 'AI Maturity & Security'
  },
  {
    period: '2025',
    topics: ['Predictive AI', 'IoT Integration', 'Quantum Computing'],
    totalPapers: 42,
    dominantTheme: 'Emerging Technologies' // Projected
  }
];

const mockEmergingTechnologies: EmergingTech[] = [
  {
    id: 'generative-ai',
    name: 'Generative AI & Large Language Models',
    maturity: 'emerging',
    adoption: 75,
    potential: 95,
    timeframe: '1-2 years',
    category: 'Artificial Intelligence',
    description: 'Advanced AI models capable of generating human-like text, images, and code. Applications in content creation, code generation, and automated assistance.',
    keyTechnologies: ['ChatGPT', 'GPT-4', 'Claude', 'Gemini', 'Llama'],
    researchOpportunities: [
      'Prompt engineering and optimization',
      'AI ethics and bias mitigation',
      'Domain-specific LLM fine-tuning',
      'Educational AI assistants'
    ],
    challenges: ['Hallucination problems', 'Computational costs', 'Ethical concerns', 'Data privacy'],
    relatedPapers: 8
  },
  {
    id: 'edge-computing',
    name: 'Edge Computing & IoT',
    maturity: 'growing',
    adoption: 65,
    potential: 85,
    timeframe: '2-3 years',
    category: 'Infrastructure',
    description: 'Processing data closer to the source rather than in centralized cloud servers. Critical for real-time applications and IoT devices.',
    keyTechnologies: ['5G Networks', 'Edge AI', 'IoT Sensors', 'Fog Computing', 'Edge Analytics'],
    researchOpportunities: [
      'Smart city applications',
      'Healthcare monitoring systems',
      'Industrial IoT optimization',
      'Edge AI model deployment'
    ],
    challenges: ['Security concerns', 'Standardization', 'Device limitations', 'Network latency'],
    relatedPapers: 5
  },
  {
    id: 'quantum-computing',
    name: 'Quantum Computing',
    maturity: 'experimental',
    adoption: 15,
    potential: 98,
    timeframe: '5-10 years',
    category: 'Computing Paradigm',
    description: 'Computing technology based on quantum mechanics principles, promising exponential speedup for specific problem classes.',
    keyTechnologies: ['Quantum Algorithms', 'Qubits', 'Quantum Annealing', 'Quantum Cryptography', 'Quantum Simulators'],
    researchOpportunities: [
      'Quantum algorithm development',
      'Quantum machine learning',
      'Cryptography and security',
      'Optimization problems'
    ],
    challenges: ['Hardware limitations', 'Error correction', 'Scalability', 'Cost barriers'],
    relatedPapers: 2
  },
  {
    id: 'blockchain-web3',
    name: 'Blockchain & Web3',
    maturity: 'growing',
    adoption: 55,
    potential: 80,
    timeframe: '2-4 years',
    category: 'Distributed Systems',
    description: 'Decentralized technologies enabling trustless transactions, smart contracts, and distributed applications.',
    keyTechnologies: ['Smart Contracts', 'DeFi', 'NFTs', 'Ethereum', 'Decentralized Storage'],
    researchOpportunities: [
      'Supply chain transparency',
      'Decentralized identity systems',
      'Educational credential verification',
      'Governance mechanisms'
    ],
    challenges: ['Scalability issues', 'Energy consumption', 'Regulatory uncertainty', 'User adoption'],
    relatedPapers: 4
  },
  {
    id: 'extended-reality',
    name: 'Extended Reality (XR)',
    maturity: 'growing',
    adoption: 60,
    potential: 88,
    timeframe: '2-3 years',
    category: 'Immersive Technology',
    description: 'Combination of VR, AR, and MR technologies creating immersive digital experiences.',
    keyTechnologies: ['VR Headsets', 'AR Glasses', 'Spatial Computing', 'Haptic Feedback', 'Digital Twins'],
    researchOpportunities: [
      'Immersive learning environments',
      'Virtual collaboration spaces',
      'Healthcare training simulations',
      'Architectural visualization'
    ],
    challenges: ['Hardware costs', 'Motion sickness', 'Content creation', 'Accessibility'],
    relatedPapers: 6
  },
  {
    id: 'neuromorphic-computing',
    name: 'Neuromorphic Computing',
    maturity: 'experimental',
    adoption: 20,
    potential: 92,
    timeframe: '5-8 years',
    category: 'Computing Architecture',
    description: 'Computer architectures inspired by the human brain, designed for efficient AI and pattern recognition.',
    keyTechnologies: ['Spiking Neural Networks', 'Brain-inspired Chips', 'Neuromorphic Processors', 'Memristors'],
    researchOpportunities: [
      'Energy-efficient AI',
      'Real-time pattern recognition',
      'Autonomous systems',
      'Brain-computer interfaces'
    ],
    challenges: ['Development complexity', 'Programming paradigm shift', 'Limited tooling', 'Niche applications'],
    relatedPapers: 1
  }
];

export const ResearchInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState('themes');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // State for real-time data - NO MOCK DATA
  const [researchThemes, setResearchThemes] = useState<ResearchTheme[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendPeriod[]>([]);
  const [emergingTechnologies, setEmergingTechnologies] = useState<EmergingTech[]>([]);
  
  // State for modal
  const [selectedTech, setSelectedTech] = useState<EmergingTech | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Classification Guide modal
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  
  // State for Emerging Technologies filtering
  const [techSearchTerm, setTechSearchTerm] = useState('');
  const [techCategoryFilter, setTechCategoryFilter] = useState<string>('all');

  // Fetch real-time data from Supabase
  useEffect(() => {
    fetchResearchInsights();
    
    // Set up real-time subscription to abstracts table
    const channel = supabase
      .channel('research-insights-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'abstracts',
          filter: 'status=eq.approved'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh insights when data changes
          fetchResearchInsights();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResearchInsights = async () => {
    try {
      setIsLoading(true);

      // Fetch all approved abstracts (with manual research_theme field)
      console.log('🔍 Fetching approved abstracts...');
      const { data: abstracts, error: abstractsError } = await supabase
        .from('abstracts')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      console.log('� Abstracts result:', { 
        count: abstracts?.length || 0, 
        error: abstractsError
      });

      if (abstractsError) {
        console.error('❌ Error fetching abstracts:', abstractsError);
        toast({
          title: "Database Error",
          description: `Could not load abstracts: ${abstractsError.message}`,
          variant: "destructive",
        });
        setResearchThemes([]);
        setTrendAnalysis([]);
        setEmergingTechnologies([]);
      } else if (abstracts && abstracts.length > 0) {
        console.log(`✅ Found ${abstracts.length} approved abstracts`);
        
        // Process Research Themes from manual research_theme field
        const themes = processResearchThemesFromManualField(abstracts);
        console.log('✅ Processed themes:', themes);
        setResearchThemes(themes);

        // Process Trend Analysis
        const trends = processTrendAnalysisFromManualThemes(abstracts);
        console.log('📈 Processed trends:', trends);
        setTrendAnalysis(trends);

        // Process Emerging Technologies
        const emerging = processEmergingTechnologies(abstracts);
        console.log('⚡ Processed emerging tech:', emerging);
        setEmergingTechnologies(emerging);
      } else {
        console.warn('⚠️ No approved abstracts found');
        setResearchThemes([]);
        setTrendAnalysis([]);
        setEmergingTechnologies([]);
      }
    } catch (error: any) {
      console.error('Error fetching research insights:', error);
      toast({
        title: "Error Loading Insights",
        description: "Failed to load research insights from database.",
        variant: "destructive",
      });
      setResearchThemes([]);
      setTrendAnalysis([]);
      setEmergingTechnologies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Process research themes from manual research_theme field
  const processResearchThemesFromManualField = (abstracts: any[]): ResearchTheme[] => {
    const currentYear = new Date().getFullYear();
    const themeMap = new Map<string, {
      papers: Set<string>;
      domains: Set<string>;
      frequency: number;
      yearlyCount: Map<number, number>;
    }>();

    // Group abstracts by their manual research_themes (can be multiple per abstract)
    abstracts.forEach(abstract => {
      // Use research_themes array, or fallback to research_theme, or skip if neither exists
      const themes = abstract.research_themes || (abstract.research_theme ? [abstract.research_theme] : []);
      
      // Skip abstracts without any themes assigned
      if (themes.length === 0) return;
      
      const year = abstract.year || new Date(abstract.created_at).getFullYear();

      // Count this abstract for each theme it belongs to
      themes.forEach((themeName: string) => {
        if (!themeName) return;

        if (!themeMap.has(themeName)) {
          themeMap.set(themeName, {
            papers: new Set(),
            domains: new Set(),
            frequency: 0,
            yearlyCount: new Map()
          });
        }

        const themeData = themeMap.get(themeName)!;
        themeData.papers.add(abstract.title);
        themeData.frequency++;
        
        const currentCount = themeData.yearlyCount.get(year) || 0;
        themeData.yearlyCount.set(year, currentCount + 1);

        // Add domains from extracted entities
        if (abstract.extracted_entities?.domains) {
          abstract.extracted_entities.domains.forEach((domain: string) => {
            themeData.domains.add(domain);
          });
        }
      });
    });

    // Convert to ResearchTheme array
    const themes: ResearchTheme[] = [];

    themeMap.forEach((data, themeName) => {
      const currentYearCount = data.yearlyCount.get(currentYear) || 0;
      const lastYearCount = data.yearlyCount.get(currentYear - 1) || 0;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let growth = '0%';
      
      if (lastYearCount > 0) {
        const growthPercent = ((currentYearCount - lastYearCount) / lastYearCount) * 100;
        growth = `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(0)}%`;
        
        if (growthPercent > 5) trend = 'up';
        else if (growthPercent < -5) trend = 'down';
      } else if (currentYearCount > 0) {
        trend = 'up';
        growth = '+100%';
      }

      const significance: 'high' | 'medium' | 'low' = 
        data.frequency >= 10 ? 'high' :
        data.frequency >= 5 ? 'medium' : 'low';

      themes.push({
        id: themeName.toLowerCase().replace(/\s+/g, '-'),
        theme: themeName,
        frequency: data.frequency,
        trend,
        papers: Array.from(data.papers).slice(0, 5),
        relatedDomains: Array.from(data.domains).slice(0, 5),
        growth,
        significance,
        description: `Research theme with ${data.papers.size} approved ${data.papers.size === 1 ? 'abstract' : 'abstracts'}`
      });
    });

    return themes.sort((a, b) => b.frequency - a.frequency);
  };

  // NEW: Process trend analysis from manual themes
  const processTrendAnalysisFromManualThemes = (abstracts: any[]): TrendPeriod[] => {
    const yearlyData = new Map<number, {
      papers: Set<string>;
      themes: Map<string, number>;
    }>();

    abstracts.forEach(abstract => {
      const year = abstract.year || new Date(abstract.created_at).getFullYear();
      // Use research_themes array, or fallback to research_theme, or skip if neither exists
      const themes = abstract.research_themes || (abstract.research_theme ? [abstract.research_theme] : []);
      
      // Skip abstracts without any themes assigned
      if (themes.length === 0) return;
      
      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          papers: new Set(),
          themes: new Map()
        });
      }

      const data = yearlyData.get(year)!;
      data.papers.add(abstract.id);

      // Count each theme
      themes.forEach((theme: string) => {
        if (theme) {
          const count = data.themes.get(theme) || 0;
          data.themes.set(theme, count + 1);
        }
      });
    });

    const trends: TrendPeriod[] = [];
    const sortedYears = Array.from(yearlyData.keys()).sort();

    sortedYears.forEach(year => {
      const data = yearlyData.get(year)!;
      
      const topThemes = Array.from(data.themes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);

      const dominantTheme = topThemes.length > 0 
        ? topThemes[0]
        : 'General Research';

      trends.push({
        period: year.toString(),
        topics: topThemes,
        totalPapers: data.papers.size,
        dominantTheme
      });
    });

    return trends;
  };

  const processResearchThemesFromDB = (themeStats: any[]): ResearchTheme[] => {
    const currentYear = new Date().getFullYear();
    console.log('🔧 Processing theme stats. Raw data:', themeStats);

    return themeStats.map(theme => {
      console.log(`📊 Theme: "${theme.name}" - total_abstracts: ${theme.total_abstracts}, primary: ${theme.primary_abstracts}`);

      // Calculate growth trend based on active years
      const activeYears = theme.active_years || [];
      const hasCurrentYear = activeYears.includes(currentYear);
      const hasLastYear = activeYears.includes(currentYear - 1);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      let growth = '0%';
      
      if (hasCurrentYear && !hasLastYear) {
        trend = 'up';
        growth = '+100%';
      } else if (!hasCurrentYear && hasLastYear) {
        trend = 'down';
        growth = '-100%';
      } else if (hasCurrentYear && hasLastYear) {
        // Stable trend if present in both years
        trend = 'stable';
        growth = '0%';
      }

      const significance: 'high' | 'medium' | 'low' = 
        theme.total_abstracts >= 10 ? 'high' :
        theme.total_abstracts >= 5 ? 'medium' : 'low';

      return {
        id: theme.name.toLowerCase().replace(/\s+/g, '-'),
        theme: theme.name,
        frequency: theme.total_abstracts || 0,
        trend,
        papers: [], // Will be populated on demand
        relatedDomains: [],
        growth,
        significance,
        description: `Research theme with ${theme.total_abstracts || 0} approved abstracts (${theme.primary_abstracts || 0} as primary theme). Average confidence: ${Math.round((theme.avg_confidence || 0) * 100)}%`
      };
    }).filter(theme => theme.frequency > 0); // Only show themes with abstracts
  };

  const processTrendAnalysisFromThemes = async (abstracts: any[]): Promise<TrendPeriod[]> => {
    // Fetch abstract themes for all approved abstracts
    const { data: abstractThemes, error } = await supabase
      .from('abstract_themes')
      .select(`
        abstract_id,
        is_primary,
        research_themes!inner(name)
      `)
      .in('abstract_id', abstracts.map(a => a.id));

    if (error) {
      console.error('Error fetching abstract themes:', error);
      return [];
    }

    const yearlyData = new Map<number, {
      papers: Set<string>;
      themes: Map<string, number>;
    }>();

    abstracts.forEach(abstract => {
      const year = abstract.year || new Date(abstract.created_at).getFullYear();
      
      if (!yearlyData.has(year)) {
        yearlyData.set(year, {
          papers: new Set(),
          themes: new Map()
        });
      }

      const data = yearlyData.get(year)!;
      data.papers.add(abstract.id);

      // Get themes for this abstract
      const themes = abstractThemes?.filter(at => at.abstract_id === abstract.id) || [];
      themes.forEach(themeAssoc => {
        const themeName = (themeAssoc.research_themes as any).name;
        const count = data.themes.get(themeName) || 0;
        data.themes.set(themeName, count + 1);
      });
    });

    // Convert to TrendPeriod array
    const trends: TrendPeriod[] = [];
    const sortedYears = Array.from(yearlyData.keys()).sort();

    sortedYears.forEach(year => {
      const data = yearlyData.get(year)!;
      
      // Get top 5 themes for the year
      const topThemes = Array.from(data.themes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme]) => theme);

      // Determine dominant theme
      const dominantTheme = topThemes.length > 0 
        ? topThemes[0]
        : 'General Research';

      trends.push({
        period: year.toString(),
        topics: topThemes,
        totalPapers: data.papers.size,
        dominantTheme
      });
    });

    return trends;
  };

  // NEW: Process emerging technologies from validated emerging_technologies field
  const processEmergingTechnologies = (abstracts: any[]): EmergingTech[] => {
    const currentYear = new Date().getFullYear();
    
    // Technology tracking with metadata
    const techMetadata = new Map<string, {
      papers: Set<string>;
      paperDetails: Array<any>;
      years: Map<number, number>;
      firstSeen: number;
      lastSeen: number;
      totalMentions: number;
    }>();

    // Collect technologies from validated emerging_technologies field
    abstracts.forEach(abstract => {
      const technologies = abstract.emerging_technologies || [];
      if (technologies.length === 0) return;

      const year = abstract.year || new Date(abstract.created_at).getFullYear();

      technologies.forEach((tech: string) => {
        if (!techMetadata.has(tech)) {
          techMetadata.set(tech, {
            papers: new Set(),
            paperDetails: [],
            years: new Map(),
            firstSeen: year,
            lastSeen: year,
            totalMentions: 0
          });
        }
        const data = techMetadata.get(tech)!;
        if (!data.papers.has(abstract.id)) {
          data.papers.add(abstract.id);
          data.paperDetails.push({
            id: abstract.id,
            title: abstract.title,
            authors: abstract.student_name || abstract.authors || 'Unknown',
            year: year,
            abstract: abstract.abstract_text
          });
        }
        data.years.set(year, (data.years.get(year) || 0) + 1);
        data.firstSeen = Math.min(data.firstSeen, year);
        data.lastSeen = Math.max(data.lastSeen, year);
        data.totalMentions++;
      });
    });

    // Build emerging technologies list
    const emergingTechs: EmergingTech[] = [];

    techMetadata.forEach((data, techName) => {
      const paperCount = data.papers.size;
      const isActive = data.lastSeen >= currentYear - 1; // Active in last year
      
      // Calculate growth rate
      const currentYearCount = data.years.get(currentYear) || 0;
      const lastYearCount = data.years.get(currentYear - 1) || 0;
      const growthRate = lastYearCount > 0 
        ? ((currentYearCount - lastYearCount) / lastYearCount) * 100 
        : (currentYearCount > 0 ? 100 : 0);

      // Determine maturity level based on paper count
      let maturity: 'experimental' | 'emerging' | 'growing';
      if (paperCount <= 5) {
        maturity = 'experimental';
      } else if (paperCount <= 12) {
        maturity = 'emerging';
      } else {
        maturity = 'growing';
      }

      // Calculate adoption percentage (max 20 papers = 100%)
      const adoption = Math.min((paperCount / 20) * 100, 100);
      
      // Calculate potential based on recent activity and growth
      const isRecent = data.firstSeen >= currentYear - 2;
      const isGrowing = growthRate > 50;
      const potential = Math.min(
        80 + (isRecent ? 10 : 0) + (isGrowing ? 10 : 0),
        100
      );

      // Estimate mainstream adoption timeframe
      const timeframe = 
        maturity === 'experimental' ? '3-5 years' :
        maturity === 'emerging' ? '1-3 years' :
        '1-2 years';

      // Generate metadata for this technology
      const opportunities = generateResearchOpportunities(techName);
      const challenges = generateChallenges(maturity);
      const keyTechnologies = generateKeyTechnologies(techName);

      emergingTechs.push({
        id: techName.toLowerCase().replace(/\s+/g, '-'),
        name: techName,
        maturity,
        adoption: Math.round(adoption),
        potential: Math.round(potential),
        timeframe,
        category: techName,
        description: `Active research area in technology with ${paperCount} recent ${paperCount === 1 ? 'paper' : 'papers'}. Estimated mainstream adoption timeframe: ${timeframe}.`,
        keyTechnologies,
        researchOpportunities: opportunities,
        challenges,
        relatedPapers: paperCount,
        papers: data.paperDetails
      });
    });

    // Sort by potential (high potential first) and then by paper count
    return emergingTechs.sort((a, b) => {
      if (b.potential !== a.potential) {
        return b.potential - a.potential;
      }
      return b.relatedPapers - a.relatedPapers;
    });
  };

  // Helper function to generate research opportunities
  const generateResearchOpportunities = (techName: string): string[] => {
    return [
      `${techName} integration in educational systems`,
      `Performance optimization for ${techName} applications`,
      `Real-world implementation of ${techName}`,
      `Comparative analysis with alternative technologies`
    ];
  };

  // Helper function to generate challenges
  const generateChallenges = (maturity: string): string[] => {
    const baseChallenges = ['Limited documentation', 'Skill gap', 'Resource availability'];
    
    if (maturity === 'experimental') {
      return [...baseChallenges, 'Unproven at scale', 'Rapid changes'];
    } else if (maturity === 'emerging') {
      return [...baseChallenges, 'Standardization needed', 'Tool maturity'];
    } else {
      return [...baseChallenges, 'Market competition', 'Integration complexity'];
    }
  };

  // Helper function to generate key technologies based on tech category
  const generateKeyTechnologies = (techName: string): string[] => {
    // Return specific technologies based on category name
    const techMap: Record<string, string[]> = {
      'Web Technologies': ['React', 'Node.js', 'PHP', 'JavaScript', 'HTML/CSS'],
      'IoT & Hardware': ['Arduino', 'Raspberry Pi', 'Sensors', 'Microcontrollers', 'ESP32'],
      'Data & Analytics': ['MySQL', 'Data Visualization', 'Business Intelligence', 'Dashboards', 'Reports'],
      'Security & Authentication': ['Encryption', 'Biometrics', 'Access Control', 'Authentication', 'Security Protocols'],
      'Identification & Tracking': ['QR Code', 'RFID', 'Facial Recognition', 'GPS', 'Barcode'],
      'Mobile Technologies': ['Android', 'iOS', 'React Native', 'Mobile Development', 'Cross-platform'],
      'Frameworks & Programming': ['Agile', 'Java', 'Python', 'Software Development', 'Best Practices'],
      'Immersive Technologies': ['VR', 'AR', 'Virtual Reality', 'Augmented Reality', '3D Simulation'],
      'Cloud & Backend Services': ['Firebase', 'Cloud Storage', 'APIs', 'Backend Development', 'Server Management'],
      'Machine Learning & AI': ['Neural Networks', 'Computer Vision', 'NLP', 'Prediction Models', 'AI Algorithms'],
      'Geographic Information Systems': ['GIS', 'Mapping', 'Geospatial Analysis', 'Location Services', 'Satellite Data']
    };
    
    return techMap[techName] || [techName, 'Development Tools', 'Frameworks', 'Libraries', 'Best Practices'];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Filter emerging technologies based on search and category
  const filteredTechnologies = emergingTechnologies.filter(tech => {
    const matchesSearch = techSearchTerm === '' || 
      tech.name.toLowerCase().includes(techSearchTerm.toLowerCase()) ||
      tech.description.toLowerCase().includes(techSearchTerm.toLowerCase());
    
    const matchesCategory = techCategoryFilter === 'all' || tech.category === techCategoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(emergingTechnologies.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research Insights</h2>
          <p className="text-gray-600">Discover patterns and opportunities in your research portfolio</p>
        </div>
        
        {/* Classification Guide Button */}
        <Button
          variant="outline"
          onClick={() => setIsGuideModalOpen(true)}
          className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Brain className="h-4 w-4" />
          Understanding Classifications
        </Button>
      </div>

      {/* Classification Guide Modal */}
      <Dialog open={isGuideModalOpen} onOpenChange={setIsGuideModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="h-5 w-5" />
              Understanding Research Classifications
            </DialogTitle>
            <DialogDescription className="text-blue-700">
              How we analyze and categorize research abstracts in the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-blue-200 bg-blue-50">
                  <th className="text-left py-3 px-4 font-semibold text-blue-900">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-900">Basis</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-900">How to Identify</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-900">Example Output</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Domains */}
                <tr className="border-b border-gray-200 hover:bg-green-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-green-700">
                      🎯 <span>Domains</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Application areas</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Application areas or fields of study your research focuses on
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Keywords indicating <strong>where</strong> the technology or method is applied
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Education</Badge>
                      <Badge variant="outline" className="text-xs">Healthcare</Badge>
                      <Badge variant="outline" className="text-xs">Agriculture</Badge>
                    </div>
                  </td>
                </tr>

                {/* Technologies */}
                <tr className="border-b border-gray-200 hover:bg-blue-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-blue-700">
                      ⚙️ <span>Technologies</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Tools & systems</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Tools, systems, computing models, or software frameworks used
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Keywords describing <strong>what</strong> is being built or used
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">AI</Badge>
                      <Badge variant="outline" className="text-xs">IoT</Badge>
                      <Badge variant="outline" className="text-xs">Web-Based Systems</Badge>
                    </div>
                  </td>
                </tr>

                {/* Methodologies */}
                <tr className="border-b border-gray-200 hover:bg-orange-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-orange-700">
                      📊 <span>Methodologies</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Approaches used</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Research approaches, techniques, or frameworks used to conduct the study
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Keywords describing <strong>how</strong> the research is done
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Agile Development</Badge>
                      <Badge variant="outline" className="text-xs">Data Mining</Badge>
                      <Badge variant="outline" className="text-xs">Machine Learning</Badge>
                    </div>
                  </td>
                </tr>

                {/* Recurring Themes */}
                <tr className="border-b border-gray-200 hover:bg-purple-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-purple-700">
                      <Brain className="h-4 w-4" /> <span>Recurring Themes</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Pattern analysis</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Frequent combinations of domain-tech-methodology
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Count and cluster repeated topics
                  </td>
                  <td className="py-3 px-4 text-gray-700 italic">
                    "Management Systems in Education"
                  </td>
                </tr>

                {/* Trends & Analysis */}
                <tr className="border-b border-gray-200 hover:bg-green-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-green-700">
                      <Activity className="h-4 w-4" /> <span>Trends & Analysis</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Temporal changes</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Changes over time in research focus
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Year-based counts and graphs
                  </td>
                  <td className="py-3 px-4 text-gray-700 italic">
                    "Rise of Mobile-Based Systems (2020-2025)"
                  </td>
                </tr>

                {/* Emerging Technologies */}
                <tr className="hover:bg-yellow-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-yellow-700">
                      <Zap className="h-4 w-4" /> <span>Emerging Technologies</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Innovation indicators</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    Recently introduced tools or concepts
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    New, low-frequency, modern keywords
                  </td>
                  <td className="py-3 px-4 text-gray-700 italic">
                    "AI Chatbots, Blockchain, AR/VR"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Analyzing research data...</p>
            </div>
          </CardContent>
        </Card>
      ) : researchThemes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">No Research Data Available</p>
                <p className="text-sm text-gray-600">Submit and approve abstracts to see insights.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Research Themes
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Trend Analysis
            </TabsTrigger>
            <TabsTrigger value="emerging" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Emerging Technologies
            </TabsTrigger>
          </TabsList>
          
          {/* Real-Time Indicator Badge */}
          <Badge variant="outline" className="ml-auto flex items-center gap-1 border-green-300 text-green-700 bg-green-50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Data
          </Badge>
        </div>

        {/* Research Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Research Themes in NBSC-ICS</CardTitle>
              <CardDescription>
                Real-time analysis of research patterns and emerging themes based on approved abstract submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {researchThemes.map((theme) => (
                  <Card 
                    key={theme.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      selectedTheme === theme.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTheme(selectedTheme === theme.id ? null : theme.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{theme.theme}</h3>
                          {getTrendIcon(theme.trend)}
                          <Badge className={getSignificanceColor(theme.significance)}>
                            {theme.significance} impact
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{theme.frequency}</div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{theme.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Total Abstracts</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {theme.frequency}
                            </span>
                            <span className="text-sm text-gray-500">approved</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Unique Papers</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-purple-600">
                              {theme.papers.length}
                            </span>
                            <span className="text-sm text-gray-500">publications</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Percentage</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              {((theme.frequency / researchThemes.reduce((sum, t) => sum + t.frequency, 0)) * 100).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500">of total</span>
                          </div>
                        </div>
                      </div>

                      {selectedTheme === theme.id && (
                        <div className="border-t pt-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Related Papers</h4>
                            <div className="flex flex-wrap gap-2">
                              {theme.papers.map((paper, index) => (
                                <Badge key={index} variant="outline">{paper}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Related Domains</h4>
                            <div className="flex flex-wrap gap-2">
                              {theme.relatedDomains.map((domain, index) => (
                                <Badge key={index} variant="secondary">{domain}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Evolution Timeline</CardTitle>
              <CardDescription>
                Real-time tracking of how research themes have evolved from 2020-2025 at NBSC-ICS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trendAnalysis.map((period, index) => (
                  <div key={period.period} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      {index < trendAnalysis.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{period.period}</h3>
                        <Badge variant="outline">{period.totalPapers} papers</Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{period.dominantTheme}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {period.topics.map((topic, topicIndex) => (
                          <Badge key={topicIndex} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emerging Technologies Tab */}
        <TabsContent value="emerging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Emerging Technologies in Information Technology
              </CardTitle>
              <CardDescription>
                Real-time exploration of cutting-edge technologies with high research potential for NBSC-ICS students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search technologies, descriptions, or tools..."
                      value={techSearchTerm}
                      onChange={(e) => setTechSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <Select value={techCategoryFilter} onValueChange={setTechCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {filteredTechnologies.length} of {emergingTechnologies.length} technologies
                  </span>
                  {(techSearchTerm || techCategoryFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTechSearchTerm('');
                        setTechCategoryFilter('all');
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Technologies List */}
              <div className="grid gap-6">
                {filteredTechnologies.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-900 font-medium">No technologies found</p>
                      <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTechnologies.map((tech) => (
                  <Card 
                    key={tech.id} 
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {tech.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Research Papers</div>
                          <div className="text-2xl font-bold text-purple-600">{tech.relatedPapers}</div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{tech.description}</p>

                      {/* Key Technologies */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Technologies & Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {tech.keyTechnologies.map((keyTech, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {keyTech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedTech(tech);
                            setIsModalOpen(true);
                          }}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
                )}
              </div>

              {/* Summary Card */}
              <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Why Focus on Emerging Technologies?
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Researching emerging technologies positions you at the forefront of innovation. These areas offer:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                          <span><strong>High impact potential:</strong> Groundbreaking research opportunities with significant academic and industry interest</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                          <span><strong>Skill development:</strong> Gain expertise in technologies that will define the next decade</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-purple-600 mt-0.5" />
                          <span><strong>Career advancement:</strong> Stand out in competitive job markets and graduate programs</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      {/* Emerging Technology Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTech && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Zap className="h-6 w-6 text-purple-600" />
                      {selectedTech.name}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedTech.description}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="bg-gray-50">
                    {selectedTech.category}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {selectedTech.relatedPapers} Related Papers
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Key Technologies */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      Key Technologies & Concepts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTech.keyTechnologies.map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Related Papers Section */}
                {selectedTech.papers && selectedTech.papers.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Related Papers ({selectedTech.papers.length})
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedTech.papers.map((paper, idx) => (
                          <div 
                            key={paper.id} 
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                                {paper.title}
                              </h4>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {paper.year}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Author:</span> {paper.authors}
                            </p>
                            {paper.abstract && (
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {paper.abstract}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
