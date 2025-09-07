import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  X, 
  AlertCircle, 
  Tag, 
  Search, 
  Filter,
  Edit,
  Save,
  RefreshCw,
  BookOpen,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Database,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Entity {
  id: string;
  value: string;
  type: "keyword" | "research-field" | "technology" | "methodology" | "location" | "person";
  confidence: number;
  status: "pending" | "validated" | "rejected" | "modified";
  source: string; // Which abstract/document it came from
  sourceTitle: string;
  extractedBy: "ocr" | "nlp" | "manual";
  validatedBy?: string;
  validatedAt?: string;
  category?: string;
  alternatives?: string[];
  notes?: string;
}

const EntityValidation: React.FC = () => {
  const { toast } = useToast();
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: "1",
      value: "Machine Learning",
      type: "technology",
      confidence: 0.95,
      status: "validated",
      source: "abstract-1",
      sourceTitle: "ML Applications in Agriculture",
      extractedBy: "nlp",
      validatedBy: "Dr. Maria Santos",
      validatedAt: "2024-09-07",
      category: "Artificial Intelligence",
    },
    {
      id: "2",
      value: "Precision Agriculture",
      type: "research-field",
      confidence: 0.88,
      status: "pending",
      source: "abstract-1",
      sourceTitle: "ML Applications in Agriculture",
      extractedBy: "nlp",
      category: "Agriculture Technology",
    },
    {
      id: "3",
      value: "Deep Neural Networks",
      type: "methodology",
      confidence: 0.92,
      status: "pending",
      source: "abstract-2",
      sourceTitle: "Medical Image Analysis",
      extractedBy: "nlp",
      alternatives: ["Deep Learning", "Neural Networks", "CNN"],
    },
    {
      id: "4",
      value: "IoT Sensors",
      type: "technology",
      confidence: 0.85,
      status: "modified",
      source: "abstract-3",
      sourceTitle: "Smart City Infrastructure",
      extractedBy: "ocr",
      category: "Internet of Things",
      notes: "Modified from 'IoT sensor devices'",
    }
  ]);

  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("validation");

  // Validation form state
  const [validationForm, setValidationForm] = useState({
    status: "",
    value: "",
    type: "",
    category: "",
    alternatives: "",
    notes: ""
  });

  const openValidationDialog = (entity: Entity) => {
    setSelectedEntity(entity);
    setValidationForm({
      status: entity.status,
      value: entity.value,
      type: entity.type,
      category: entity.category || "",
      alternatives: entity.alternatives?.join(", ") || "",
      notes: entity.notes || ""
    });
    setIsValidationDialogOpen(true);
  };

  const handleValidateEntity = () => {
    if (!selectedEntity) return;

    const updatedEntities = entities.map(entity =>
      entity.id === selectedEntity.id
        ? {
            ...entity,
            status: validationForm.status as any,
            value: validationForm.value,
            type: validationForm.type as any,
            category: validationForm.category,
            alternatives: validationForm.alternatives.split(",").map(alt => alt.trim()).filter(Boolean),
            notes: validationForm.notes,
            validatedBy: "Dr. Maria Santos", // Current user
            validatedAt: new Date().toISOString().split('T')[0],
          }
        : entity
    );

    setEntities(updatedEntities);
    setIsValidationDialogOpen(false);
    setSelectedEntity(null);
    
    toast({
      title: "Entity Validated",
      description: `"${validationForm.value}" has been ${validationForm.status} successfully.`,
    });
  };

  const handleBulkValidation = (status: "validated" | "rejected") => {
    const pendingEntities = filteredEntities.filter(e => e.status === "pending");
    
    const updatedEntities = entities.map(entity =>
      pendingEntities.some(pe => pe.id === entity.id)
        ? {
            ...entity,
            status,
            validatedBy: "Dr. Maria Santos",
            validatedAt: new Date().toISOString().split('T')[0],
          }
        : entity
    );

    setEntities(updatedEntities);
    
    toast({
      title: "Bulk Validation",
      description: `${pendingEntities.length} entities have been ${status}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "modified": return "outline";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "keyword": return <Tag className="w-4 h-4" />;
      case "research-field": return <BookOpen className="w-4 h-4" />;
      case "technology": return <Zap className="w-4 h-4" />;
      case "methodology": return <Brain className="w-4 h-4" />;
      case "location": return <Target className="w-4 h-4" />;
      case "person": return <Target className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50";
    if (confidence >= 0.8) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.sourceTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || entity.type === filterType;
    const matchesStatus = filterStatus === "all" || entity.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const statsData = {
    total: entities.length,
    pending: entities.filter(e => e.status === "pending").length,
    validated: entities.filter(e => e.status === "validated").length,
    rejected: entities.filter(e => e.status === "rejected").length,
    avgConfidence: entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length,
  };

  const categoryStats = entities.reduce((acc, entity) => {
    if (entity.category && entity.status === "validated") {
      acc[entity.category] = (acc[entity.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Entity Validation</h2>
          <p className="text-gray-600">Verify and validate extracted research entities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleBulkValidation("validated")}
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Bulk Approve</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBulkValidation("rejected")}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Bulk Reject</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="validation">Entity Validation</TabsTrigger>
          <TabsTrigger value="analytics">Validation Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Entities</p>
                    <p className="text-2xl font-bold text-gray-900">{statsData.total}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{statsData.pending}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Validated</p>
                    <p className="text-2xl font-bold text-gray-900">{statsData.validated}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{statsData.rejected}</p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{(statsData.avgConfidence * 100).toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Label htmlFor="search">Search Entities</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by entity value or source..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="keyword">Keywords</SelectItem>
                      <SelectItem value="research-field">Research Fields</SelectItem>
                      <SelectItem value="technology">Technologies</SelectItem>
                      <SelectItem value="methodology">Methodologies</SelectItem>
                      <SelectItem value="location">Locations</SelectItem>
                      <SelectItem value="person">Persons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="modified">Modified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Entities for Validation ({filteredEntities.length})</CardTitle>
              <CardDescription>
                Review and validate extracted research entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{entity.value}</div>
                          {entity.category && (
                            <Badge variant="outline" className="text-xs">
                              {entity.category}
                            </Badge>
                          )}
                          {entity.alternatives && entity.alternatives.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Alt: {entity.alternatives.slice(0, 2).join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                          {getTypeIcon(entity.type)}
                          <span>{entity.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{entity.sourceTitle}</div>
                          <div className="text-xs text-gray-500">
                            Extracted by {entity.extractedBy}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getConfidenceColor(entity.confidence)} border-0`}>
                          {(entity.confidence * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(entity.status)}>
                          {entity.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openValidationDialog(entity)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Review</span>
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

        <TabsContent value="analytics" className="space-y-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Validated Entities by Category</CardTitle>
              <CardDescription>Distribution of successfully validated entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary">{count} entities</Badge>
                  </div>
                ))}
                {Object.keys(categoryStats).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No validated categories yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Dialog */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Validate Entity</DialogTitle>
            <DialogDescription>
              Review and modify the extracted entity information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntity && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div><strong>Source:</strong> {selectedEntity.sourceTitle}</div>
                  <div><strong>Extracted by:</strong> {selectedEntity.extractedBy}</div>
                  <div><strong>Confidence:</strong> {(selectedEntity.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validation-status">Validation Status</Label>
                  <Select value={validationForm.status} onValueChange={(value) => setValidationForm({...validationForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="modified">Modified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validation-type">Entity Type</Label>
                  <Select value={validationForm.type} onValueChange={(value) => setValidationForm({...validationForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Keyword</SelectItem>
                      <SelectItem value="research-field">Research Field</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="methodology">Methodology</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="person">Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validation-value">Entity Value</Label>
                <Input
                  id="validation-value"
                  value={validationForm.value}
                  onChange={(e) => setValidationForm({...validationForm, value: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validation-category">Category (optional)</Label>
                <Input
                  id="validation-category"
                  placeholder="e.g., Artificial Intelligence, Data Science"
                  value={validationForm.category}
                  onChange={(e) => setValidationForm({...validationForm, category: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validation-alternatives">Alternative Terms (comma-separated)</Label>
                <Input
                  id="validation-alternatives"
                  placeholder="e.g., ML, Machine Learning Algorithms"
                  value={validationForm.alternatives}
                  onChange={(e) => setValidationForm({...validationForm, alternatives: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validation-notes">Notes</Label>
                <Textarea
                  id="validation-notes"
                  placeholder="Additional notes about this validation..."
                  value={validationForm.notes}
                  onChange={(e) => setValidationForm({...validationForm, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleValidateEntity} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Save Validation</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntityValidation;
