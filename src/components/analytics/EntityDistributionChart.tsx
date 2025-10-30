import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface EntityData {
  name: string;
  value: number;
  color: string;
}

export const EntityDistributionChart: React.FC = () => {
  const [data, setData] = useState<EntityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEntityDistribution();
  }, []);

  const fetchEntityDistribution = async () => {
    try {
      setIsLoading(true);

      // Fetch all approved abstracts with extracted entities
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('extracted_entities')
        .eq('status', 'approved')
        .not('extracted_entities', 'is', null);

      if (error) throw error;

      let techCount = 0;
      let domainCount = 0;
      let methodCount = 0;

      abstracts?.forEach((abstract) => {
        const entities = abstract.extracted_entities;
        if (entities) {
          techCount += entities.technologies?.length || 0;
          domainCount += entities.domains?.length || 0;
          methodCount += entities.methodologies?.length || 0;
        }
      });

      const totalEntities = techCount + domainCount + methodCount;
      setTotal(totalEntities);

      const chartData: EntityData[] = [
        { 
          name: 'Technologies', 
          value: techCount,
          color: '#3b82f6' // blue
        },
        { 
          name: 'Research Domains', 
          value: domainCount,
          color: '#a855f7' // purple
        },
        { 
          name: 'Methodologies', 
          value: methodCount,
          color: '#10b981' // green
        }
      ].filter(item => item.value > 0);

      setData(chartData);
    } catch (error) {
      console.error('Error fetching entity distribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <p className="text-gray-500">No entity data available</p>
        <p className="text-xs text-gray-400 mt-2">Entities will appear once abstracts are approved</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.name),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: data.map(d => d.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 500
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 150; // 150ms delay between each segment
        }
        return delay;
      },
      easing: 'easeInOutQuart',
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-sm text-gray-600">Total Entities Extracted</p>
      </div>
      
      <div className="h-[280px] flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Entity breakdown list */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        {data.map((item) => (
          <div key={item.name} className="text-center p-2 border rounded-lg">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-1" 
              style={{ backgroundColor: item.color }}
            />
            <p className="text-xs font-medium text-gray-900">{item.value}</p>
            <p className="text-xs text-gray-500 truncate">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
