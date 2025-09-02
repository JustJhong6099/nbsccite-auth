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
    <div className="space-y-6">
      {/* Current Entity Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Entity Analytics</h3>
            <p className="text-sm text-gray-600">Extracted keywords and domains frequency</p>
          </div>
          <select className="text-sm border rounded px-3 py-1">
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
        
        <div className="space-y-3">
          {mockEntityData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  item.trend === 'up' ? 'bg-green-500' : 
                  item.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="font-medium">{item.category}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold">{item.count}</div>
                  <div className={`text-xs ${
                    item.yearlyGrowth > 0 ? 'text-green-600' : 
                    item.yearlyGrowth < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.yearlyGrowth > 0 ? '+' : ''}{item.yearlyGrowth}% YoY
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(item.count / Math.max(...mockEntityData.map(d => d.count))) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Yearly Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Trends (2020-2025)</h3>
        
        <ResponsiveContainer width="100%" height={300}>
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
      </div>
    </div>
  );
};
