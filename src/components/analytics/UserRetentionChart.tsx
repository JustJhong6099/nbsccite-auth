import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import type { UserRetentionData } from '../../types/analytics';

interface UserRetentionChartProps {
  data?: UserRetentionData[];
  width?: number;
  height?: number;
}

// Mock data for placeholder
const mockRetentionData: UserRetentionData[] = [
  { date: '2025-08-03', newUsers: 12, returningUsers: 45, totalSessions: 78 },
  { date: '2025-08-04', newUsers: 8, returningUsers: 52, totalSessions: 89 },
  { date: '2025-08-05', newUsers: 15, returningUsers: 48, totalSessions: 95 },
  { date: '2025-08-06', newUsers: 20, returningUsers: 60, totalSessions: 112 },
  { date: '2025-08-07', newUsers: 18, returningUsers: 55, totalSessions: 98 },
  { date: '2025-08-08', newUsers: 25, returningUsers: 62, totalSessions: 125 },
  { date: '2025-08-09', newUsers: 22, returningUsers: 58, totalSessions: 108 },
  { date: '2025-08-10', newUsers: 30, returningUsers: 70, totalSessions: 145 },
  { date: '2025-08-11', newUsers: 28, returningUsers: 65, totalSessions: 132 },
  { date: '2025-08-12', newUsers: 35, returningUsers: 75, totalSessions: 156 },
];

export const UserRetentionChart: React.FC<UserRetentionChartProps> = ({
  data = mockRetentionData,
  height = 400
}) => {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">User Retention Analysis</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>New Users</span>
          <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
          <span>Returning Users</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="New Users"
          />
          <Line 
            type="monotone" 
            dataKey="returningUsers" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Returning Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
