import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Target,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";

// Mock data for research insights
const mockResearchThemes = [
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

const mockTrendAnalysis = [
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

export const ResearchInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState('themes');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research Insights</h2>
          <p className="text-gray-600">Discover patterns and opportunities in your research portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Themes</p>
                <p className="text-2xl font-bold">{mockResearchThemes.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Areas</p>
                <p className="text-2xl font-bold">{mockResearchThemes.filter(t => t.trend === 'up').length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Research Themes
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
        </TabsList>

        {/* Research Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Research Themes in NBSC-ICS</CardTitle>
              <CardDescription>
                Analysis of research patterns and emerging themes based on abstract submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockResearchThemes.map((theme) => (
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
                          <div className="text-sm text-gray-600">mentions</div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{theme.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Growth Rate</h4>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              theme.growth.startsWith('+') ? 'text-green-600' : 
                              theme.growth.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {theme.growth}
                            </span>
                            <span className="text-sm text-gray-500">vs last year</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Related Papers</h4>
                          <div className="text-sm text-gray-600">
                            {theme.papers.length} publications
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Frequency</h4>
                          <Progress value={(theme.frequency / 50) * 100} className="h-2" />
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
                Track how research themes have evolved from 2020-2025 at NBSC-ICS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTrendAnalysis.map((period, index) => (
                  <div key={period.period} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      {index < mockTrendAnalysis.length - 1 && (
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
      </Tabs>
    </div>
  );
};
