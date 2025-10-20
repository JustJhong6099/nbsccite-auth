import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for entity analytics
const mockEntityData = [
  { category: 'Machine Learning', count: 45, trend: 'up', yearlyGrowth: 23 },
  { category: 'Web Development', count: 38, trend: 'up', yearlyGrowth: 15 },
  { category: 'Data Science', count: 32, trend: 'up', yearlyGrowth: 34 },
  { category: 'Mobile Development', count: 28, trend: 'stable', yearlyGrowth: 8 },
  { category: 'Artificial Intelligence', count: 25, trend: 'up', yearlyGrowth: 45 },
  { category: 'Cybersecurity', count: 22, trend: 'up', yearlyGrowth: 18 },
  { category: 'Database Systems', count: 18, trend: 'down', yearlyGrowth: -5 },
  { category: 'Computer Networks', count: 15, trend: 'stable', yearlyGrowth: 2 },
];

// Mock data for yearly trends
const mockYearlyTrends = [
  { year: '2020', totalEntities: 120, uniqueKeywords: 85, researchDomains: 12 },
  { year: '2021', totalEntities: 145, uniqueKeywords: 102, researchDomains: 15 },
  { year: '2022', totalEntities: 178, uniqueKeywords: 125, researchDomains: 18 },
  { year: '2023', totalEntities: 210, uniqueKeywords: 156, researchDomains: 22 },
  { year: '2024', totalEntities: 245, uniqueKeywords: 189, researchDomains: 25 },
  { year: '2025', totalEntities: 285, uniqueKeywords: 218, researchDomains: 28 },
];

export const EntityAnalyticsChart: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Yearly Trends Graph */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={mockYearlyTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="totalEntities" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
            name="Total Entities"
          />
          <Area 
            type="monotone" 
            dataKey="uniqueKeywords" 
            stackId="2"
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.6}
            name="Unique Keywords"
          />
          <Area 
            type="monotone" 
            dataKey="researchDomains" 
            stackId="3"
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.6}
            name="Research Domains"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mockYearlyTrends[mockYearlyTrends.length - 1].totalEntities}</div>
          <div className="text-xs text-gray-600 mt-1">Total Entities</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{mockYearlyTrends[mockYearlyTrends.length - 1].uniqueKeywords}</div>
          <div className="text-xs text-gray-600 mt-1">Unique Keywords</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{mockYearlyTrends[mockYearlyTrends.length - 1].researchDomains}</div>
          <div className="text-xs text-gray-600 mt-1">Research Domains</div>
        </div>
      </div>
    </div>
  );
};
