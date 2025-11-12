import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Mail,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  status: string;
  department?: string;
  position?: string;
  abstracts_count?: number;
}

export const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<User[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription for profile changes
    const profileChannel = supabase
      .channel('user_management_profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          fetchUsers();
        }
      )
      .subscribe();

    // Set up real-time subscription for abstract changes
    const abstractChannel = supabase
      .channel('user_management_abstracts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'abstracts'
        },
        (payload) => {
          console.log('Abstract change detected:', payload);
          fetchUsers();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(abstractChannel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      if (profilesData) {
        // Fetch abstract counts for each user
        const usersWithCounts = await Promise.all(
          profilesData.map(async (user) => {
            // Get abstract count for this user
            const { count, error: countError } = await supabase
              .from('abstracts')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', user.id);

            if (countError) {
              console.error(`Error fetching count for user ${user.id}:`, countError);
            }

            return {
              ...user,
              abstracts_count: count || 0
            };
          })
        );

        const studentUsers = usersWithCounts.filter(user => user.role === 'student');
        const facultyUsers = usersWithCounts.filter(user => user.role === 'faculty');
        
        setStudents(studentUsers);
        setFaculty(facultyUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const allUsers = [...students, ...faculty];

  const getUsersForTab = () => {
    switch (activeTab) {
      case 'students':
        return students;
      case 'faculty':
        return faculty;
      default:
        return allUsers;
    }
  };

  const filteredUsers = getUsersForTab().filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Limit to 10 users unless "Show All" is enabled
  const displayedUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Student</Badge>;
      case 'faculty':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Faculty</Badge>;
      case 'admin':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      // Toggle between 'active' and 'rejected' (displayed as Inactive)
      const newStatus = user.status === 'active' ? 'rejected' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User status changed to ${newStatus === 'active' ? 'Active' : 'Inactive'} successfully`,
      });

      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
    
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>Real-time view and management of all registered users with abstract counts</CardDescription>
              </div>
              {/* Real-Time Indicator Badge */}
              <Badge variant="outline" className="flex items-center gap-1 border-green-300 text-green-700 bg-green-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="faculty">Faculty ({faculty.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      {activeTab === 'students' && <TableHead>Abstracts</TableHead>}
                      {activeTab === 'faculty' && <TableHead>Department</TableHead>}
                      {activeTab === 'all' && <TableHead>Details</TableHead>}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-gray-500">Loading users...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500">No users found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        {activeTab === 'students' && (
                          <TableCell>
                            <Badge variant="outline">{user.abstracts_count || 0}</Badge>
                          </TableCell>
                        )}
                        {activeTab === 'faculty' && (
                          <TableCell>
                            <Badge variant="outline">{user.department || 'Not specified'}</Badge>
                          </TableCell>
                        )}
                        {activeTab === 'all' && (
                          <TableCell>
                            {user.role === 'student' ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {user.abstracts_count || 0} abstracts
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                {user.department || 'N/A'}
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(user)}
                                className={user.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                              >
                                {user.status === 'active' ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Set Inactive
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Set Active
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Show All / Show Less Button */}
              {filteredUsers.length > 10 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllUsers(!showAllUsers)}
                  >
                    {showAllUsers ? (
                      <>Show Less (10 users)</>
                    ) : (
                      <>Show All ({filteredUsers.length} users)</>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
