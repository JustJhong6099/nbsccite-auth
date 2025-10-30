import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StatsData {
  totalAbstracts: number;
  totalApproved: number;
  pendingApprovals: number;
  totalRejected: number;
}

export const AdminStatsCards: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalAbstracts: 0,
    totalApproved: 0,
    pendingApprovals: 0,
    totalRejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscription for live updates
    const abstractsChannel = supabase
      .channel('abstracts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'abstracts' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(abstractsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total abstracts count
      const { count: totalAbstracts } = await supabase
        .from('abstracts')
        .select('*', { count: 'exact', head: true });

      // Fetch approved abstracts count
      const { count: totalApproved } = await supabase
        .from('abstracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch pending approvals count
      const { count: pendingApprovals } = await supabase
        .from('abstracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch rejected abstracts count
      const { count: totalRejected } = await supabase
        .from('abstracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      setStats({
        totalAbstracts: totalAbstracts || 0,
        totalApproved: totalApproved || 0,
        pendingApprovals: pendingApprovals || 0,
        totalRejected: totalRejected || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const statCards = [
    {
      title: 'Total Abstracts',
      value: stats.totalAbstracts,
      icon: FileText,
      color: 'blue',
      change: '+12.5%',
      changeType: 'positive' as const,
      description: 'This week'
    },
    {
      title: 'Total Approved',
      value: stats.totalApproved,
      icon: CheckCircle,
      color: 'green',
      change: '+3',
      changeType: 'positive' as const,
      description: 'Approved abstracts'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'orange',
      change: '-2',
      changeType: 'negative' as const,
      description: 'From yesterday'
    },
    {
      title: 'Total Rejected',
      value: stats.totalRejected,
      icon: XCircle,
      color: 'red',
      change: '+1',
      changeType: 'negative' as const,
      description: 'This month'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="mt-4 h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.changeType === 'positive';
        
        return (
          <div key={card.title} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg border ${getColorClasses(card.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">{card.change}</span>
              </div>
              <span className="text-sm text-gray-500 ml-2">{card.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
