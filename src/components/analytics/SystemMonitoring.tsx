import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Monitor,
  RefreshCw,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Eye,
  Search,
  Filter,
  Download
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for system monitoring
const systemMetrics = {
  uptime: '15 days, 8 hours',
  totalRequests: 12847,
  activeUsers: 23,
  errorRate: 0.02,
  avgResponseTime: 245,
  apiCallsToday: 342,
  storageUsed: 68.5,
  cpuUsage: 45.2,
  memoryUsage: 62.8
};

const performanceData = [
  { time: '00:00', responseTime: 180, requests: 45, errors: 0 },
  { time: '04:00', responseTime: 165, requests: 32, errors: 1 },
  { time: '08:00', responseTime: 220, requests: 89, errors: 2 },
  { time: '12:00', responseTime: 280, requests: 156, errors: 3 },
  { time: '16:00', responseTime: 245, requests: 134, errors: 1 },
  { time: '20:00', responseTime: 190, requests: 67, errors: 0 },
];

const apiUsageData = [
  { endpoint: '/api/auth/login', calls: 1245, avgTime: 120, errors: 5, status: 'healthy' },
  { endpoint: '/api/abstracts/submit', calls: 892, avgTime: 340, errors: 12, status: 'warning' },
  { endpoint: '/api/ocr/extract', calls: 567, avgTime: 2150, errors: 8, status: 'healthy' },
  { endpoint: '/api/entities/extract', calls: 445, avgTime: 890, errors: 3, status: 'healthy' },
  { endpoint: '/api/users/profile', calls: 2134, avgTime: 95, errors: 2, status: 'healthy' },
  { endpoint: '/api/admin/analytics', calls: 234, avgTime: 450, errors: 1, status: 'healthy' },
];

const usageLogs = [
  {
    id: '1',
    timestamp: '2024-01-20 14:30:15',
    user: 'john.smith@student.nbsc.edu',
    action: 'Abstract Submission',
    endpoint: '/api/abstracts/submit',
    status: 'success',
    responseTime: 340,
    ip: '192.168.1.105'
  },
  {
    id: '2',
    timestamp: '2024-01-20 14:28:42',
    user: 'admin@nbsc.edu',
    action: 'User Management',
    endpoint: '/api/admin/users',
    status: 'success',
    responseTime: 125,
    ip: '192.168.1.100'
  },
  {
    id: '3',
    timestamp: '2024-01-20 14:25:18',
    user: 'maria.garcia@student.nbsc.edu',
    action: 'OCR Text Extraction',
    endpoint: '/api/ocr/extract',
    status: 'error',
    responseTime: 5000,
    ip: '192.168.1.108',
    error: 'Processing timeout'
  },
  {
    id: '4',
    timestamp: '2024-01-20 14:22:33',
    user: 'sarah.johnson@nbsc.edu',
    action: 'Faculty Login',
    endpoint: '/api/auth/login',
    status: 'success',
    responseTime: 89,
    ip: '192.168.1.102'
  },
];

const dataAccuracy = [
  { metric: 'Entity Extraction Accuracy', value: 92.5, trend: 'up', target: 90 },
  { metric: 'OCR Text Recognition', value: 88.3, trend: 'stable', target: 85 },
  { metric: 'Technology Classification', value: 94.1, trend: 'up', target: 90 },
  { metric: 'Domain Categorization', value: 89.7, trend: 'down', target: 90 },
  { metric: 'Keyword Extraction', value: 91.2, trend: 'up', target: 88 },
];

export const SystemMonitoring: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedLogFilter, setSelectedLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = usageLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedLogFilter === 'all' || log.status === selectedLogFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApiStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
          <p className="text-gray-600">Monitor system performance, API usage, and data accuracy</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-xl font-bold text-green-600">{systemMetrics.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{systemMetrics.activeUsers}</p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-green-600">{(systemMetrics.errorRate * 100).toFixed(2)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{systemMetrics.avgResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                <p className="text-2xl font-bold">{systemMetrics.apiCallsToday}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{systemMetrics.cpuUsage}%</span>
              <Badge className={systemMetrics.cpuUsage < 70 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {systemMetrics.cpuUsage < 70 ? 'Normal' : 'High'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${systemMetrics.cpuUsage < 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${systemMetrics.cpuUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{systemMetrics.memoryUsage}%</span>
              <Badge className={systemMetrics.memoryUsage < 80 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {systemMetrics.memoryUsage < 80 ? 'Normal' : 'Critical'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${systemMetrics.memoryUsage < 80 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${systemMetrics.memoryUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{systemMetrics.storageUsed}%</span>
              <Badge className={systemMetrics.storageUsed < 80 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {systemMetrics.storageUsed < 80 ? 'Normal' : 'Warning'}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${systemMetrics.storageUsed < 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${systemMetrics.storageUsed}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api">API Usage</TabsTrigger>
          <TabsTrigger value="logs">Usage Logs</TabsTrigger>
          <TabsTrigger value="accuracy">Data Accuracy</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance (Last 24 Hours)</CardTitle>
              <CardDescription>Response times, request volume, and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} name="Response Time (ms)" />
                  <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} name="Requests" />
                  <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>Monitor API endpoint usage and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Total Calls</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiUsageData.map((api, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{api.endpoint}</code>
                      </TableCell>
                      <TableCell>{api.calls.toLocaleString()}</TableCell>
                      <TableCell>{api.avgTime}ms</TableCell>
                      <TableCell>
                        <span className={api.errors > 10 ? 'text-red-600' : 'text-green-600'}>
                          {api.errors}
                        </span>
                      </TableCell>
                      <TableCell>{getApiStatusBadge(api.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Usage Logs</CardTitle>
                  <CardDescription>Real-time user activity and system events</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedLogFilter} onValueChange={setSelectedLogFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">{log.timestamp}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.user}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{log.action}</div>
                          <code className="text-xs text-gray-500">{log.endpoint}</code>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <span className={log.responseTime > 1000 ? 'text-red-600' : 'text-green-600'}>
                          {log.responseTime}ms
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{log.ip}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Accuracy Metrics</CardTitle>
              <CardDescription>Monitor AI model performance and data quality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dataAccuracy.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{metric.metric}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16">
                          Target: {metric.target}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        metric.value >= metric.target ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {metric.value}%
                      </div>
                      <Badge className={metric.value >= metric.target ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {metric.value >= metric.target ? 'On Target' : 'Below Target'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
