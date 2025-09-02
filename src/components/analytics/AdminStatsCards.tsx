import React from 'react';
import { TrendingUp, TrendingDown, Users, UserCheck, Clock, Award } from 'lucide-react';
import type { AdminStats } from '../../types/analytics';

interface AdminStatsCardsProps {
  stats?: AdminStats;
}

// Mock stats data
const mockStats: AdminStats = {
  totalUsers: 158,
  activeFaculty: 25,
  pendingApprovals: 8,
  totalStudents: 125,
  weeklyGrowth: 12.5,
  monthlyGrowth: 23.8,
};

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats = mockStats
}) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      change: `+${stats.weeklyGrowth}%`,
      changeType: 'positive' as const,
      description: 'This week'
    },
    {
      title: 'Active Faculty',
      value: stats.activeFaculty,
      icon: UserCheck,
      color: 'green',
      change: '+3',
      changeType: 'positive' as const,
      description: 'New this month'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: Award,
      color: 'purple',
      change: `+${stats.monthlyGrowth}%`,
      changeType: 'positive' as const,
      description: 'Monthly growth'
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
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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
