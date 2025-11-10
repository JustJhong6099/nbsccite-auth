import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { normalizeTerm, getTopTermsByCategory } from '@/lib/data-normalization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DomainData {
  name: string;
  count: number;
  color: string;
}

type FilterType = 'domains' | 'technologies' | 'methodologies';

// Diverse light color palette - each bar gets a different color
const LIGHT_COLORS = [
  'rgba(147, 197, 253, 0.7)',  // Light blue
  'rgba(167, 243, 208, 0.7)',  // Light emerald
  'rgba(253, 186, 116, 0.7)',  // Light orange
  'rgba(196, 181, 253, 0.7)',  // Light purple
  'rgba(251, 207, 232, 0.7)',  // Light pink
  'rgba(165, 243, 252, 0.7)',  // Light cyan
  'rgba(196, 181, 253, 0.7)',  // Light violet
  'rgba(254, 215, 170, 0.7)',  // Light amber
  'rgba(191, 219, 254, 0.7)',  // Light sky blue
  'rgba(187, 247, 208, 0.7)',  // Light green
  'rgba(254, 202, 202, 0.7)',  // Light red
  'rgba(224, 231, 255, 0.7)',  // Light indigo
];

const BORDER_COLORS = [
  'rgba(59, 130, 246, 1)',     // blue-500
  'rgba(16, 185, 129, 1)',     // emerald-500
  'rgba(249, 115, 22, 1)',     // orange-500
  'rgba(168, 85, 247, 1)',     // purple-500
  'rgba(236, 72, 153, 1)',     // pink-500
  'rgba(6, 182, 212, 1)',      // cyan-500
  'rgba(139, 92, 246, 1)',     // violet-500
  'rgba(245, 158, 11, 1)',     // amber-500
  'rgba(14, 165, 233, 1)',     // sky-500
  'rgba(34, 197, 94, 1)',      // green-500
  'rgba(239, 68, 68, 1)',      // red-500
  'rgba(99, 102, 241, 1)',     // indigo-500
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

      // Fetch only approved abstracts with keywords and entities
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('id, keywords, extracted_entities')
        .eq('status', 'approved');

      if (error) throw error;

      console.log('Fetched approved abstracts for domains:', abstracts);

      // Count unique papers per term instead of term occurrences
      const termToPapers = new Map<string, Set<string>>();

      abstracts?.forEach((abstract) => {
        const abstractId = abstract.id || JSON.stringify(abstract); // Use ID or fallback to stringified object
        const termsToCollect: string[] = [];

        if (activeFilter === 'domains') {
          // Collect keywords
          const keywords = abstract.keywords || [];
          termsToCollect.push(...keywords);

          // Collect extracted domains
          const domains = abstract.extracted_entities?.domains || [];
          termsToCollect.push(...domains);
        } else if (activeFilter === 'technologies') {
          // Collect extracted technologies
          const technologies = abstract.extracted_entities?.technologies || [];
          termsToCollect.push(...technologies);
        } else if (activeFilter === 'methodologies') {
          // Collect extracted methodologies
          const methodologies = abstract.extracted_entities?.methodologies || [];
          termsToCollect.push(...methodologies);
        }

        // For each term, add this abstract's ID to the set
        termsToCollect.forEach(term => {
          const normalized = normalizeTerm(term, true);
          if (normalized) {
            if (!termToPapers.has(normalized)) {
              termToPapers.set(normalized, new Set());
            }
            termToPapers.get(normalized)!.add(abstractId);
          }
        });
      });

      // Convert to counts (number of unique papers per term)
      const domainCounts: { [key: string]: number } = {};
      termToPapers.forEach((papers, term) => {
        domainCounts[term] = papers.size; // Count unique papers
      });

      console.log(`${activeFilter} counts:`, domainCounts);

      // Get top 8 items using category-filtered utility function
      const sortedDomains = getTopTermsByCategory(domainCounts, 8, activeFilter);

      console.log(`Top ${activeFilter} (filtered):`, sortedDomains);

      // Format data for Chart.js
      const chartData: DomainData[] = sortedDomains.map(([name, count]) => ({
        name,
        count,
        color: '' // Will use gradient instead
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

    // Prepare data for horizontal bar chart with diverse light colors
    const chartData = {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: `Number of Papers`,
          data: data.map(d => d.count),
          backgroundColor: data.map((_, index) => LIGHT_COLORS[index % LIGHT_COLORS.length]),
          borderColor: data.map((_, index) => BORDER_COLORS[index % BORDER_COLORS.length]),
          borderWidth: 2,
          borderRadius: 6,
          barThickness: 28,
        },
      ],
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        delay: (context) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default') {
            delay = context.dataIndex * 120; // 120ms delay between each bar for smooth stagger
          }
          return delay;
        },
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold',
          },
          bodyFont: {
            size: 13,
          },
          callbacks: {
            label: (context) => {
              return `${context.parsed.y} ${context.parsed.y === 1 ? 'paper' : 'papers'}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            font: {
              size: 11,
              weight: 'bold' as const,
            },
            color: '#1f2937',
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          border: {
            display: false,
          },
          ticks: {
            stepSize: 1,
            font: {
              size: 11,
            },
            color: '#6b7280',
          },
          title: {
            display: true,
            text: 'Number of Papers',
            font: {
              size: 12,
              weight: 'bold',
            },
            color: '#374151',
          },
        },
      },
    };

    return (
      <div className="h-[400px]">
        <Bar key={activeFilter} data={chartData} options={options} />
      </div>
    );
  };

  return (
    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="domains" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
          🎯 Domains
        </TabsTrigger>
        <TabsTrigger value="technologies" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
          ⚙️ Technologies
        </TabsTrigger>
        <TabsTrigger value="methodologies" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800">
          📊 Methodologies
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="domains" className="mt-0">
        <p className="text-xs text-gray-600 mb-4 italic">
          Application areas and academic disciplines
        </p>
        {renderContent()}
      </TabsContent>
      
      <TabsContent value="technologies" className="mt-0">
        <p className="text-xs text-gray-600 mb-4 italic">
          Tools, computing models, and software frameworks
        </p>
        {renderContent()}
      </TabsContent>
      
      <TabsContent value="methodologies" className="mt-0">
        <p className="text-xs text-gray-600 mb-4 italic">
          Research and development approaches
        </p>
        {renderContent()}
      </TabsContent>
    </Tabs>
  );
};
