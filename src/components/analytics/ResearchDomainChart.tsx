import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for research domains over years
const mockResearchDomainData = [
  { year: 2020, 'Machine Learning': 12, 'Web Development': 8, 'Data Science': 6, 'Mobile Dev': 5, 'AI': 4, 'Cybersecurity': 3 },
  { year: 2021, 'Machine Learning': 18, 'Web Development': 12, 'Data Science': 10, 'Mobile Dev': 7, 'AI': 8, 'Cybersecurity': 5 },
  { year: 2022, 'Machine Learning': 25, 'Web Development': 18, 'Data Science': 15, 'Mobile Dev': 12, 'AI': 14, 'Cybersecurity': 8 },
  { year: 2023, 'Machine Learning': 32, 'Web Development': 25, 'Data Science': 22, 'Mobile Dev': 18, 'AI': 20, 'Cybersecurity': 12 },
  { year: 2024, 'Machine Learning': 38, 'Web Development': 32, 'Data Science': 28, 'Mobile Dev': 23, 'AI': 28, 'Cybersecurity': 18 },
  { year: 2025, 'Machine Learning': 45, 'Web Development': 38, 'Data Science': 32, 'Mobile Dev': 28, 'AI': 35, 'Cybersecurity': 22 },
];

// Domain colors
const domainColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
];

// Mock data for current year distribution
const currentYearData = [
  { name: 'Machine Learning', value: 45, color: '#3b82f6' },
  { name: 'Web Development', value: 38, color: '#10b981' },
  { name: 'Data Science', value: 32, color: '#f59e0b' },
  { name: 'Mobile Dev', value: 28, color: '#ef4444' },
  { name: 'AI', value: 35, color: '#8b5cf6' },
  { name: 'Cybersecurity', value: 22, color: '#06b6d4' },
];

export const ResearchDomainChart: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [viewType, setViewType] = useState<'trends' | 'distribution'>('trends');

  const yearlyData = mockResearchDomainData.find(data => data.year === selectedYear);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Research Domain Analysis</h3>
            <p className="text-sm text-gray-600">Multi-year domain frequency tracking (2020-2025)</p>
          </div>
          <div className="flex space-x-3">
            <select 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value as 'trends' | 'distribution')}
              className="text-sm border rounded px-3 py-1"
            >
              <option value="trends">Trends</option>
              <option value="distribution">Distribution</option>
            </select>
            {viewType === 'distribution' && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm border rounded px-3 py-1"
              >
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
                <option value={2022}>2022</option>
                <option value={2021}>2021</option>
                <option value={2020}>2020</option>
              </select>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {mockResearchDomainData[mockResearchDomainData.length - 1]['Machine Learning']}
            </div>
            <div className="text-sm text-blue-600">ML Projects (2025)</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(mockResearchDomainData[0]).length - 1}
            </div>
            <div className="text-sm text-green-600">Active Domains</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round(((mockResearchDomainData[5]['Machine Learning'] - mockResearchDomainData[0]['Machine Learning']) / mockResearchDomainData[0]['Machine Learning']) * 100)}%
            </div>
            <div className="text-sm text-yellow-600">ML Growth (5yr)</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.values(mockResearchDomainData[5]).slice(1).reduce((a: number, b: number) => a + b, 0)}
            </div>
            <div className="text-sm text-purple-600">Total Projects (2025)</div>
          </div>
        </div>

        {/* Charts */}
        {viewType === 'trends' ? (
          <div>
            <h4 className="text-md font-medium mb-4">Domain Trends (2020-2025)</h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={mockResearchDomainData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="Machine Learning" 
                  stroke={domainColors[0]} 
                  strokeWidth={3}
                  dot={{ fill: domainColors[0], strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Web Development" 
                  stroke={domainColors[1]} 
                  strokeWidth={2}
                  dot={{ fill: domainColors[1], strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Data Science" 
                  stroke={domainColors[2]} 
                  strokeWidth={2}
                  dot={{ fill: domainColors[2], strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="AI" 
                  stroke={domainColors[4]} 
                  strokeWidth={2}
                  dot={{ fill: domainColors[4], strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Cybersecurity" 
                  stroke={domainColors[5]} 
                  strokeWidth={2}
                  dot={{ fill: domainColors[5], strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="text-md font-medium mb-4">Distribution for {selectedYear}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentYearData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {currentYearData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart for selected year */}
            <div>
              <h4 className="text-md font-medium mb-4">Project Count for {selectedYear}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentYearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {currentYearData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Domain Details Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold mb-4">Domain Performance Summary</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Domain</th>
                <th className="text-right py-2">2020</th>
                <th className="text-right py-2">2023</th>
                <th className="text-right py-2">2025</th>
                <th className="text-right py-2">Growth</th>
                <th className="text-center py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(mockResearchDomainData[0]).slice(1).map((domain, index) => {
                const data2020 = mockResearchDomainData[0][domain as keyof typeof mockResearchDomainData[0]] as number;
                const data2023 = mockResearchDomainData[3][domain as keyof typeof mockResearchDomainData[3]] as number;
                const data2025 = mockResearchDomainData[5][domain as keyof typeof mockResearchDomainData[5]] as number;
                const growth = Math.round(((data2025 - data2020) / data2020) * 100);
                
                return (
                  <tr key={domain} className="border-b">
                    <td className="py-3 font-medium">{domain}</td>
                    <td className="text-right py-3">{data2020}</td>
                    <td className="text-right py-3">{data2023}</td>
                    <td className="text-right py-3">{data2025}</td>
                    <td className={`text-right py-3 font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growth > 0 ? '+' : ''}{growth}%
                    </td>
                    <td className="text-center py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        growth > 100 ? 'bg-green-100 text-green-800' :
                        growth > 50 ? 'bg-blue-100 text-blue-800' :
                        growth > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {growth > 100 ? 'High' : growth > 50 ? 'Strong' : growth > 0 ? 'Moderate' : 'Declining'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
