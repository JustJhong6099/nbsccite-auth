import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for submissions monitoring
const mockSubmissionsData = [
  { month: 'Jan 2025', submissions: 28, approved: 24, rejected: 3, pending: 1 },
  { month: 'Feb 2025', submissions: 35, approved: 30, rejected: 4, pending: 1 },
  { month: 'Mar 2025', submissions: 42, approved: 38, rejected: 2, pending: 2 },
  { month: 'Apr 2025', submissions: 38, approved: 35, rejected: 1, pending: 2 },
  { month: 'May 2025', submissions: 45, approved: 40, rejected: 3, pending: 2 },
  { month: 'Jun 2025', submissions: 52, approved: 48, rejected: 2, pending: 2 },
  { month: 'Jul 2025', submissions: 48, approved: 44, rejected: 1, pending: 3 },
  { month: 'Aug 2025', submissions: 55, approved: 50, rejected: 2, pending: 3 },
];

export const SubmissionsChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Submissions</h3>
          <p className="text-sm text-gray-600">Abstract submission trends over time</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Total</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rejected</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={mockSubmissionsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="submissions" fill="#3b82f6" name="Total Submissions" />
          <Bar dataKey="approved" fill="#10b981" name="Approved" />
          <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="font-semibold text-blue-600">
            {mockSubmissionsData.reduce((sum, item) => sum + item.submissions, 0)}
          </div>
          <div className="text-blue-500">Total Submissions</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="font-semibold text-green-600">
            {mockSubmissionsData.reduce((sum, item) => sum + item.approved, 0)}
          </div>
          <div className="text-green-500">Approved</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="font-semibold text-red-600">
            {mockSubmissionsData.reduce((sum, item) => sum + item.rejected, 0)}
          </div>
          <div className="text-red-500">Rejected</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="font-semibold text-yellow-600">
            {mockSubmissionsData.reduce((sum, item) => sum + item.pending, 0)}
          </div>
          <div className="text-yellow-500">Pending</div>
        </div>
      </div>
    </div>
  );
};
