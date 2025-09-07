import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Upload, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Tag,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Abstract {
  id: string;
  title: string;
  authors: string[];
  department: string;
  researchType: "faculty" | "student-assisted" | "collaborative";
  status: "draft" | "published" | "under-review";
  abstract: string;
  keywords: string[];
  dateCreated: string;
  lastModified: string;
  fileUrl?: string;
}

const AbstractManagement: React.FC = () => {
  const { toast } = useToast();
  const [abstracts, setAbstracts] = useState<Abstract[]>([
    {
      id: "1",
      title: "Machine Learning Applications in Precision Agriculture",
      authors: ["Dr. Maria Santos", "John Doe (Student)"],
      department: "Computer Science",
      researchType: "student-assisted",
      status: "published",
      abstract: "This research explores the application of machine learning algorithms in precision agriculture...",
      keywords: ["Machine Learning", "Agriculture", "IoT", "Data Analytics"],
      dateCreated: "2024-08-15",
      lastModified: "2024-09-01",
      fileUrl: "/documents/ml-agriculture.pdf"
    },
    {
      id: "2",
      title: "IoT-Based Smart City Infrastructure",
      authors: ["Dr. Maria Santos"],
      department: "Computer Science",
      researchType: "faculty",
      status: "draft",
      abstract: "An investigation into IoT implementation for smart city development...",
      keywords: ["IoT", "Smart Cities", "Infrastructure", "Technology"],
      dateCreated: "2024-09-05",
      lastModified: "2024-09-06",
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAbstract, setSelectedAbstract] = useState<Abstract | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for new/edit abstract
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    department: "",
    researchType: "faculty" as "faculty" | "student-assisted" | "collaborative",
    abstract: "",
    keywords: "",
  });

  const handleAddAbstract = () => {
    const newAbstract: Abstract = {
      id: Date.now().toString(),
      title: formData.title,
      authors: formData.authors.split(",").map(author => author.trim()),
      department: formData.department,
      researchType: formData.researchType,
      status: "draft",
      abstract: formData.abstract,
      keywords: formData.keywords.split(",").map(keyword => keyword.trim()),
      dateCreated: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };

    setAbstracts([...abstracts, newAbstract]);
    setIsAddDialogOpen(false);
    setFormData({
      title: "",
      authors: "",
      department: "",
      researchType: "faculty",
      abstract: "",
      keywords: "",
    });
    
    toast({
      title: "Abstract Added",
      description: "Your research abstract has been successfully added.",
    });
  };

  const handleEditAbstract = () => {
    if (!selectedAbstract) return;

    const updatedAbstracts = abstracts.map(abstract =>
      abstract.id === selectedAbstract.id
        ? {
            ...abstract,
            title: formData.title,
            authors: formData.authors.split(",").map(author => author.trim()),
            department: formData.department,
            researchType: formData.researchType,
            abstract: formData.abstract,
            keywords: formData.keywords.split(",").map(keyword => keyword.trim()),
            lastModified: new Date().toISOString().split('T')[0],
          }
        : abstract
    );

    setAbstracts(updatedAbstracts);
    setIsEditDialogOpen(false);
    setSelectedAbstract(null);
    
    toast({
      title: "Abstract Updated",
      description: "Your research abstract has been successfully updated.",
    });
  };

  const handleDeleteAbstract = (id: string) => {
    setAbstracts(abstracts.filter(abstract => abstract.id !== id));
    toast({
      title: "Abstract Deleted",
      description: "The research abstract has been removed.",
      variant: "destructive",
    });
  };

  const openEditDialog = (abstract: Abstract) => {
    setSelectedAbstract(abstract);
    setFormData({
      title: abstract.title,
      authors: abstract.authors.join(", "),
      department: abstract.department,
      researchType: abstract.researchType,
      abstract: abstract.abstract,
      keywords: abstract.keywords.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const filteredAbstracts = abstracts.filter(abstract => {
    const matchesSearch = abstract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         abstract.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || abstract.status === filterStatus;
    const matchesType = filterType === "all" || abstract.researchType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "under-review": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "faculty": return "bg-blue-100 text-blue-800";
      case "student-assisted": return "bg-green-100 text-green-800";
      case "collaborative": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Abstract Management</h2>
          <p className="text-gray-600">Manage your research abstracts and publications</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add New Abstract</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Research Abstract</DialogTitle>
              <DialogDescription>
                Upload or create a new research abstract entry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter research title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authors">Authors (comma-separated)</Label>
                <Input
                  id="authors"
                  placeholder="Dr. John Smith, Jane Doe (Student)"
                  value={formData.authors}
                  onChange={(e) => setFormData({...formData, authors: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="researchType">Research Type</Label>
                  <Select value={formData.researchType} onValueChange={(value: any) => setFormData({...formData, researchType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">Faculty Research</SelectItem>
                      <SelectItem value="student-assisted">Student-Assisted</SelectItem>
                      <SelectItem value="collaborative">Collaborative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="Machine Learning, IoT, Agriculture"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  placeholder="Enter your research abstract here..."
                  className="min-h-32"
                  value={formData.abstract}
                  onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAbstract}>
                  Add Abstract
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
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
              <Label htmlFor="search">Search Abstracts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title or keywords..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="faculty">Faculty Research</SelectItem>
                  <SelectItem value="student-assisted">Student-Assisted</SelectItem>
                  <SelectItem value="collaborative">Collaborative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abstracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Research Abstracts ({filteredAbstracts.length})</CardTitle>
          <CardDescription>
            Manage and organize your research publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbstracts.map((abstract) => (
                <TableRow key={abstract.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{abstract.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {abstract.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                        {abstract.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{abstract.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {abstract.authors.map((author, index) => (
                        <div key={index} className="text-sm flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {author}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(abstract.researchType)}>
                      {abstract.researchType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(abstract.status)}>
                      {abstract.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(abstract.lastModified).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // View abstract logic
                          toast({
                            title: "Abstract Preview",
                            description: abstract.abstract.substring(0, 100) + "...",
                          });
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(abstract)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {abstract.fileUrl && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAbstract(abstract.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Research Abstract</DialogTitle>
            <DialogDescription>
              Update your research abstract information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-authors">Authors (comma-separated)</Label>
              <Input
                id="edit-authors"
                value={formData.authors}
                onChange={(e) => setFormData({...formData, authors: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-researchType">Research Type</Label>
                <Select value={formData.researchType} onValueChange={(value: any) => setFormData({...formData, researchType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">Faculty Research</SelectItem>
                    <SelectItem value="student-assisted">Student-Assisted</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
              <Input
                id="edit-keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-abstract">Abstract</Label>
              <Textarea
                id="edit-abstract"
                className="min-h-32"
                value={formData.abstract}
                onChange={(e) => setFormData({...formData, abstract: e.target.value})}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAbstract}>
                Update Abstract
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbstractManagement;
