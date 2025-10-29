import React, { useEffect, useState, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';

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
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
}

type TimeFilter = 'week' | 'month';

export const SubmissionTrendsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchSubmissionTrends();
  }, [timeFilter]);

  const getWeekNumber = (date: Date): string => {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `W${week} '${date.getFullYear().toString().slice(-2)}`;
  };

  const fetchSubmissionTrends = async () => {
    try {
      setIsLoading(true);

      // Fetch all abstracts with status
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('submitted_date, status')
        .order('submitted_date', { ascending: true });

      if (error) throw error;

      // Group by selected time period
      const groupedData: { [key: string]: { total: number; approved: number; pending: number; rejected: number } } = {};

      abstracts?.forEach((abstract) => {
        const date = new Date(abstract.submitted_date);
        let periodKey: string;

        if (timeFilter === 'week') {
          periodKey = getWeekNumber(date);
        } else {
          // Format as "Feb 2025" for better readability
          periodKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        }

        if (!groupedData[periodKey]) {
          groupedData[periodKey] = { total: 0, approved: 0, pending: 0, rejected: 0 };
        }
        
        groupedData[periodKey].total++;
        
        if (abstract.status === 'approved') {
          groupedData[periodKey].approved++;
        } else if (abstract.status === 'pending') {
          groupedData[periodKey].pending++;
        } else if (abstract.status === 'rejected') {
          groupedData[periodKey].rejected++;
        }
      });

      // Convert to array format for chart
      let chartData: ChartData[] = Object.entries(groupedData).map(([period, counts]) => ({
        period,
        submissions: counts.total,
        approved: counts.approved,
        pending: counts.pending,
        rejected: counts.rejected
      }));

      // For monthly view, ensure Aug-Dec are displayed
      if (timeFilter === 'month') {
        const allMonths: ChartData[] = [];
        const currentYear = new Date().getFullYear();
        
        // Generate Aug, Sep, Oct, Nov, Dec for current year
        const monthsToShow = [7, 8, 9, 10, 11]; // August (7) to December (11)
        
        for (const monthIndex of monthsToShow) {
          const date = new Date(currentYear, monthIndex, 1);
          const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          // Find existing data for this month or create empty entry
          const existingData = chartData.find(d => d.period === monthKey);
          
          if (existingData) {
            allMonths.push(existingData);
          } else {
            allMonths.push({
              period: monthKey,
              submissions: 0,
              approved: 0,
              pending: 0,
              rejected: 0
            });
          }
        }
        
        chartData = allMonths;
      } else {
        // For weekly view, keep last 12 weeks
        chartData = chartData.slice(-12);
      }

      // Set date range
      if (chartData.length > 0) {
        setDateRange({
          start: chartData[0].period,
          end: chartData[chartData.length - 1].period
        });
      }

      setData(chartData);
    } catch (error) {
      console.error('Error fetching submission trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">No date range</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('week')}
            >
              Weekly
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('month')}
            >
              Monthly
            </Button>
          </div>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-gray-500">No submission data available</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.period),
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
        display: false // We'll create a custom legend below
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
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
            size: 12
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          precision: 0,
          callback: function(value) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with date range and filter buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {dateRange.start} - {dateRange.end}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('week')}
            className="h-8"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Weekly
          </Button>
          <Button
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('month')}
            className="h-8"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Monthly
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[240px]">
        <Bar data={chartData} options={options} />
      </div>

      {/* Custom Legend at the bottom */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t">
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
