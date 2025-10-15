import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

// v2.0: Only faculty and students (admin and pending removed)
interface UserDistribution {
  name: string;
  value: number;
  color: string;
}

export const UserDistributionChart: React.FC = () => {
  const [userDistribution, setUserDistribution] = useState<UserDistribution[]>([
    { name: 'Students', value: 0, color: '#3b82f6' },
    { name: 'Faculty', value: 0, color: '#10b981' },
  ]);
  const [legacyUsers, setLegacyUsers] = useState<{ admins: number; pending: number }>({ admins: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDistribution();
  }, []);

  const fetchUserDistribution = async () => {
    try {
      // Get faculty count
      const { count: facultyCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'faculty');

      // Get student count
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // v2.0: Scan for any legacy admin users (should be 0 after migration)
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // v2.0: Scan for any pending approvals (should be 0 after migration)
      const { count: pendingCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setUserDistribution([
        { name: 'Students', value: studentCount || 0, color: '#3b82f6' },
        { name: 'Faculty', value: facultyCount || 0, color: '#10b981' },
      ]);

      setLegacyUsers({
        admins: adminCount || 0,
        pending: pendingCount || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user distribution:', error);
      setLoading(false);
    }
  };

  const totalUsers = userDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
      
      {/* v2.0: Alert if legacy admin or pending users detected */}
      {(legacyUsers.admins > 0 || legacyUsers.pending > 0) && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Migration Notice:</strong> Found {legacyUsers.admins > 0 && `${legacyUsers.admins} admin account(s)`}
            {legacyUsers.admins > 0 && legacyUsers.pending > 0 && ' and '}
            {legacyUsers.pending > 0 && `${legacyUsers.pending} pending approval(s)`}.
            These should be converted/resolved as part of v2.0 migration.
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            {userDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
            <div className="col-span-2 pt-2 border-t">
              <span className="text-sm font-medium text-gray-700">
                Total Active Users: {totalUsers}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
