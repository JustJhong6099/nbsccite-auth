import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileBarChart,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Share,
  Eye,
  Plus,
  Settings,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  type: "summary" | "departmental" | "trend" | "comparative" | "custom";
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  status: "generated" | "generating" | "scheduled";
  createdAt: string;
  parameters: {
    departments?: string[];
    researchTypes?: string[];
    entityTypes?: string[];
    includeStudents?: boolean;
  };
  insights: {
    totalAbstracts: number;
    totalEntities: number;
    topTechnologies: string[];
    collaborationRate: number;
  };
}

const FacultyReports: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Q3 2024 Research Summary",
      type: "summary",
      description: "Comprehensive analysis of research activities and trends for Q3 2024",
      dateRange: { start: "2024-07-01", end: "2024-09-30" },
      status: "generated",
      createdAt: "2024-09-07",
      parameters: {
        departments: ["Computer Science", "Information Technology"],
        researchTypes: ["faculty", "student-assisted"],
        includeStudents: true
      },
      insights: {
        totalAbstracts: 24,
        totalEntities: 156,
        topTechnologies: ["Machine Learning", "IoT", "Data Science"],
        collaborationRate: 0.67
      }
    },
    {
      id: "2",
      title: "Departmental Technology Analysis",
      type: "departmental",
      description: "Technology adoption and research focus across all departments",
      dateRange: { start: "2024-01-01", end: "2024-09-07" },
      status: "generated",
      createdAt: "2024-09-05",
      parameters: {
        departments: ["all"],
        entityTypes: ["technology", "methodology"]
      },
      insights: {
        totalAbstracts: 45,
        totalEntities: 289,
        topTechnologies: ["AI", "Machine Learning", "Blockchain", "IoT"],
        collaborationRate: 0.43
      }
    },
    {
      id: "3",
      title: "Student Collaboration Trends",
      type: "trend",
      description: "Analysis of faculty-student collaboration patterns over time",
      dateRange: { start: "2023-09-01", end: "2024-09-07" },
      status: "generating",
      createdAt: "2024-09-07",
      parameters: {
        researchTypes: ["student-assisted", "collaborative"],
        includeStudents: true
      },
      insights: {
        totalAbstracts: 67,
        totalEntities: 412,
        topTechnologies: ["Research Methodology", "Data Analysis", "Literature Review"],
        collaborationRate: 0.89
      }
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");

  // Form state for generating new reports
  const [reportForm, setReportForm] = useState({
    title: "",
    type: "summary" as "summary" | "departmental" | "trend" | "comparative" | "custom",
    description: "",
    startDate: "",
    endDate: "",
    departments: [] as string[],
    researchTypes: [] as string[],
    entityTypes: [] as string[],
    includeStudents: true,
  });

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      title: reportForm.title,
      type: reportForm.type,
      description: reportForm.description,
      dateRange: {
        start: reportForm.startDate,
        end: reportForm.endDate
      },
      status: "generating",
      createdAt: new Date().toISOString().split('T')[0],
      parameters: {
        departments: reportForm.departments,
        researchTypes: reportForm.researchTypes,
        entityTypes: reportForm.entityTypes,
        includeStudents: reportForm.includeStudents
      },
      insights: {
        totalAbstracts: 0,
        totalEntities: 0,
        topTechnologies: [],
        collaborationRate: 0
      }
    };

    setReports([newReport, ...reports]);
    setIsGenerateDialogOpen(false);
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { 
              ...r, 
              status: "generated" as const,
              insights: {
                totalAbstracts: Math.floor(Math.random() * 50) + 10,
                totalEntities: Math.floor(Math.random() * 200) + 50,
                topTechnologies: ["Machine Learning", "Data Science", "IoT"],
                collaborationRate: Math.random() * 0.5 + 0.3
              }
            }
          : r
      ));
      
      toast({
        title: "Report Generated",
        description: `"${reportForm.title}" has been successfully generated.`,
      });
    }, 3000);

    // Reset form
    setReportForm({
      title: "",
      type: "summary",
      description: "",
      startDate: "",
      endDate: "",
      departments: [],
      researchTypes: [],
      entityTypes: [],
      includeStudents: true,
    });

    toast({
      title: "Report Generation Started",
      description: "Your report is being generated. This may take a few minutes.",
    });
  };

  const openViewDialog = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleDownloadReport = (report: Report) => {
    toast({
      title: "Download Started",
      description: `Downloading "${report.title}" as PDF...`,
    });
  };

  const handleShareReport = (report: Report) => {
    toast({
      title: "Report Shared",
      description: "Share link has been copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated": return "default";
      case "generating": return "secondary";
      case "scheduled": return "outline";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "summary": return <FileBarChart className="w-4 h-4" />;
      case "departmental": return <Users className="w-4 h-4" />;
      case "trend": return <TrendingUp className="w-4 h-4" />;
      case "comparative": return <BarChart3 className="w-4 h-4" />;
      case "custom": return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Mock insights data
  const overviewStats = {
    totalReports: reports.length,
    generatedThisMonth: reports.filter(r => {
      const reportDate = new Date(r.createdAt);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length,
    avgGenerationTime: "2.3 min",
    mostRequestedType: "summary"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Faculty Reports</h2>
          <p className="text-gray-600">Generate and manage research analysis reports</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Generate Report</span>
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="insights">Insights Dashboard</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.totalReports}</p>
                  </div>
                  <FileBarChart className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.generatedThisMonth}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Generation</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.avgGenerationTime}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Popular Type</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">{overviewStats.mostRequestedType}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Manage and download your research analysis reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Details</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Key Insights</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(report.type)}
                            <span className="font-medium">{report.title}</span>
                          </div>
                          <p className="text-sm text-gray-500">{report.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {report.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(report.dateRange.start).toLocaleDateString()}</div>
                          <div className="text-gray-500">to</div>
                          <div>{new Date(report.dateRange.end).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(report.status)} className="capitalize">
                          {report.status === "generating" && <Clock className="w-3 h-3 mr-1 animate-spin" />}
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === "generated" ? (
                          <div className="space-y-1 text-sm">
                            <div>{report.insights.totalAbstracts} abstracts</div>
                            <div>{report.insights.totalEntities} entities</div>
                            <div>{(report.insights.collaborationRate * 100).toFixed(0)}% collaboration</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Generating...</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(report)}
                            disabled={report.status === "generating"}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                            disabled={report.status === "generating"}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShareReport(report)}
                            disabled={report.status === "generating"}
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Research Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Research Activity Timeline</CardTitle>
                <CardDescription>Monthly research publication trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600">Timeline Chart Placeholder</p>
                    <p className="text-sm text-gray-500">Research activity over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Research output by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <PieChart className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600">Pie Chart Placeholder</p>
                    <p className="text-sm text-gray-500">Department-wise distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Research Technologies</CardTitle>
              <CardDescription>Most frequently mentioned technologies across all reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Machine Learning", "Internet of Things", "Data Science", "Artificial Intelligence", "Blockchain"].map((tech, index) => (
                  <div key={tech} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                      <span className="font-medium">{tech}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${100 - (index * 15)}%` }}
                        ></div>
                      </div>
                      <Badge variant="outline">{45 - (index * 8)} mentions</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Report Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsGenerateDialogOpen(true)}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileBarChart className="w-5 h-5 text-blue-500" />
                  <span>Quarterly Summary</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive quarterly research activity summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Total abstracts and entities</div>
                  <div>• Technology trends</div>
                  <div>• Collaboration metrics</div>
                  <div>• Department comparison</div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsGenerateDialogOpen(true)}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>Departmental Analysis</span>
                </CardTitle>
                <CardDescription>
                  Department-specific research focus analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Research area distribution</div>
                  <div>• Faculty-student collaboration</div>
                  <div>• Technology adoption</div>
                  <div>• Comparative analysis</div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsGenerateDialogOpen(true)}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>Trend Analysis</span>
                </CardTitle>
                <CardDescription>
                  Long-term research trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• Technology evolution</div>
                  <div>• Research methodology trends</div>
                  <div>• Publication patterns</div>
                  <div>• Emerging topics</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Report</DialogTitle>
          <DialogDescription>
            Create a custom research analysis report
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                placeholder="Q4 2024 Research Summary"
                value={reportForm.title}
                onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportForm.type} onValueChange={(value: any) => setReportForm({...reportForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Quarterly Summary</SelectItem>
                  <SelectItem value="departmental">Departmental Analysis</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                  <SelectItem value="comparative">Comparative Study</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Input
              id="report-description"
              placeholder="Brief description of the report purpose"
              value={reportForm.description}
              onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={reportForm.startDate}
                onChange={(e) => setReportForm({...reportForm, startDate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={reportForm.endDate}
                onChange={(e) => setReportForm({...reportForm, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Report generated on {selectedReport?.createdAt && new Date(selectedReport.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6 py-4">
              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedReport.insights.totalAbstracts}</div>
                      <div className="text-sm text-gray-600">Total Abstracts</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedReport.insights.totalEntities}</div>
                      <div className="text-sm text-gray-600">Extracted Entities</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedReport.insights.topTechnologies.length}</div>
                      <div className="text-sm text-gray-600">Top Technologies</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {(selectedReport.insights.collaborationRate * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Collaboration Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Findings */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50">
                      <strong>Technology Trends:</strong> The top emerging technologies in this period were {selectedReport.insights.topTechnologies.join(", ")}.
                    </div>
                    <div className="p-3 border-l-4 border-l-green-500 bg-green-50">
                      <strong>Collaboration Success:</strong> Faculty-student collaboration rate of {(selectedReport.insights.collaborationRate * 100).toFixed(0)}% shows strong mentorship engagement.
                    </div>
                    <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50">
                      <strong>Research Volume:</strong> Total of {selectedReport.insights.totalAbstracts} research abstracts with {selectedReport.insights.totalEntities} validated entities.
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>• Increase focus on emerging technologies like AI and Machine Learning</div>
                    <div>• Enhance interdisciplinary collaboration between departments</div>
                    <div>• Develop more structured mentorship programs for students</div>
                    <div>• Establish regular research methodology workshops</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleDownloadReport(selectedReport)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => handleShareReport(selectedReport)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyReports;
