import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { countNormalizedTerms, getTopTerms } from '@/lib/data-normalization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DomainData {
  name: string;
  count: number;
  color: string;
}

type FilterType = 'domains' | 'technologies' | 'methodologies';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f97316', // orange-red
];

export const TopResearchDomainsChart: React.FC = () => {
  const [data, setData] = useState<DomainData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('domains');

  useEffect(() => {
    fetchTopDomains();
  }, [activeFilter]);

  const fetchTopDomains = async () => {
    try {
      setIsLoading(true);

      // Fetch all abstracts with keywords and entities
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('keywords, extracted_entities');

      if (error) throw error;

      console.log('Fetched abstracts for domains:', abstracts);

      // Collect terms based on active filter
      const allTerms: string[] = [];

      abstracts?.forEach((abstract) => {
        if (activeFilter === 'domains') {
          // Add keywords
          const keywords = abstract.keywords || [];
          allTerms.push(...keywords);

          // Add extracted domains
          const domains = abstract.extracted_entities?.domains || [];
          allTerms.push(...domains);
        } else if (activeFilter === 'technologies') {
          // Add extracted technologies
          const technologies = abstract.extracted_entities?.technologies || [];
          allTerms.push(...technologies);
        } else if (activeFilter === 'methodologies') {
          // Add extracted methodologies
          const methodologies = abstract.extracted_entities?.methodologies || [];
          allTerms.push(...methodologies);
        }
      });

      // Use centralized normalization to count terms
      const domainCounts = countNormalizedTerms(allTerms);

      console.log(`${activeFilter} counts:`, domainCounts);

      // Get top 8 items using utility function
      const sortedDomains = getTopTerms(domainCounts, 8);

      console.log(`Top ${activeFilter}:`, sortedDomains);

      // Add colors
      const chartData: DomainData[] = sortedDomains.map(([name, count], index) => ({
        name,
        count,
        color: COLORS[index % COLORS.length]
      }));

      setData(chartData);
    } catch (error) {
      console.error('Error fetching top domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-gray-500">Loading research trends...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (data.length === 0) {
      return (
        <div className="h-[350px] flex flex-col items-center justify-center">
          <p className="text-gray-500">No {activeFilter} data available</p>
          <p className="text-xs text-gray-400 mt-2">
            {activeFilter === 'domains' 
              ? 'Add keywords to your abstracts to see domain trends'
              : `Submit abstracts with extracted ${activeFilter} to see trends`
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((domain, index) => (
          <div key={index} className="space-y-2">
            {/* Domain name and count */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{domain.name}</span>
              <span className="text-sm font-medium text-gray-600">{domain.count} papers</span>
            </div>
            
            {/* Progress bar */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(domain.count / Math.max(...data.map(d => d.count))) * 100}%`,
                  backgroundColor: domain.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="domains">Domains</TabsTrigger>
        <TabsTrigger value="technologies">Technologies</TabsTrigger>
        <TabsTrigger value="methodologies">Methodologies</TabsTrigger>
      </TabsList>
      
      <TabsContent value="domains" className="mt-0">
        {renderContent()}
      </TabsContent>
      
      <TabsContent value="technologies" className="mt-0">
        {renderContent()}
      </TabsContent>
      
      <TabsContent value="methodologies" className="mt-0">
        {renderContent()}
      </TabsContent>
    </Tabs>
  );
};
