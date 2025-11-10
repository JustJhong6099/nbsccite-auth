import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, eachMonthOfInterval } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  period: string;
  displayLabel: string;
  date: Date;
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
}

export const SubmissionTrendsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmissionTrends();
  }, []);

  const fetchSubmissionTrends = async () => {
    try {
      setIsLoading(true);

      // Fixed date range: Aug 1, 2025 - Dec 31, 2025
      const dateFrom = new Date(2025, 7, 1); // Aug 1, 2025
      const dateTo = new Date(2025, 11, 31); // Dec 31, 2025

      // Fetch all abstracts within date range
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('submitted_date, status')
        .gte('submitted_date', format(dateFrom, 'yyyy-MM-dd'))
        .lte('submitted_date', format(dateTo, 'yyyy-MM-dd'))
        .order('submitted_date', { ascending: true });

      if (error) throw error;

      // For monthly view, group by months (Aug, Sep, Oct, Nov, Dec)
      const periods = eachMonthOfInterval({ start: dateFrom, end: dateTo });

      // Initialize data structure
      const groupedData: Map<string, ChartData> = new Map();

      periods.forEach(period => {
        const key = format(period, 'yyyy-MM'); // Monthly key

        groupedData.set(key, {
          period: key,
          displayLabel: format(period, 'MMM yyyy'), // Show month name (Aug 2025)
          date: period,
          submissions: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        });
      });

      // Populate with actual data
      abstracts?.forEach((abstract) => {
        const date = new Date(abstract.submitted_date);
        const key = format(date, 'yyyy-MM'); // Monthly grouping

        const entry = groupedData.get(key);
        if (entry) {
          entry.submissions++;
          
          if (abstract.status === 'approved') {
            entry.approved++;
          } else if (abstract.status === 'pending') {
            entry.pending++;
          } else if (abstract.status === 'rejected') {
            entry.rejected++;
          }
        }
      });

      // Convert to array and sort by date
      const chartData = Array.from(groupedData.values()).sort((a, b) => 
        a.date.getTime() - b.date.getTime()
      );

      setData(chartData);
    } catch (error) {
      console.error('Error fetching submission trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const summary = data.reduce((acc, item) => ({
    total: acc.total + item.submissions,
    approved: acc.approved + item.approved,
    pending: acc.pending + item.pending,
    rejected: acc.rejected + item.rejected
  }), { total: 0, approved: 0, pending: 0, rejected: 0 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-gray-500">
            No submission data available for Aug - Dec 2025
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.displayLabel),
    datasets: [
      {
        label: 'Total Submissions',
        data: data.map(d => d.submissions),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Approved',
        data: data.map(d => d.approved),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Pending',
        data: data.map(d => d.pending),
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Rejected',
        data: data.map(d => d.rejected),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const item = data[index];
            return format(item.date, 'MMMM yyyy'); // Show month for monthly view
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
          footer: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const item = data[index];
            return `Total: ${item.submissions} submissions`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0,
          autoSkip: false,
          autoSkipPadding: 10
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          precision: 0,
          stepSize: 1,
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          }
        }
      }
    },
    animation: {
      duration: 1200,
      delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 50 + context.datasetIndex * 30;
        }
        return delay;
      },
      easing: 'easeInOutQuart',
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-[240px]">
        <Bar data={chartData} options={options} />
      </div>

      {/* Summary Text */}
      <div className="pt-3 border-t bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">
            Aug - Dec 2025 Summary:
          </span>
          {' '}
          <span className="font-bold text-blue-600">{summary.total}</span> total submissions
          {' '}
          (<span className="text-green-600 font-medium">{summary.approved} approved</span>,
          {' '}<span className="text-red-600 font-medium">{summary.rejected} rejected</span>,
          {' '}<span className="text-orange-600 font-medium">{summary.pending} pending</span>)
        </p>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
          <span className="text-xs font-medium text-gray-700">Total Submissions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-xs font-medium text-gray-700">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-xs font-medium text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-xs font-medium text-gray-700">Rejected</span>
        </div>
      </div>
    </div>
  );
};
