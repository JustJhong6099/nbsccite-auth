import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetrics {
  approvalRate: number;
  avgReviewTime: string;
  totalReviewed: number;
  reviewedThisMonth: number;
}

export const ReviewPerformanceCard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    approvalRate: 0,
    avgReviewTime: '0 days',
    totalReviewed: 0,
    reviewedThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      setIsLoading(true);

      // Fetch all abstracts
      const { data: abstracts, error } = await supabase
        .from('abstracts')
        .select('status, submitted_date, reviewed_date');

      if (error) throw error;

      // Calculate metrics
      const total = abstracts?.length || 0;
      const approved = abstracts?.filter(a => a.status === 'approved').length || 0;
      const reviewed = abstracts?.filter(a => a.reviewed_date).length || 0;

      // Calculate approval rate
      const approvalRate = reviewed > 0 ? (approved / reviewed) * 100 : 0;

      // Calculate average review time
      let totalReviewDays = 0;
      let reviewedCount = 0;

      abstracts?.forEach((abstract) => {
        if (abstract.submitted_date && abstract.reviewed_date) {
          const submitted = new Date(abstract.submitted_date);
          const reviewed = new Date(abstract.reviewed_date);
          const diffDays = Math.floor((reviewed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0) {
            totalReviewDays += diffDays;
            reviewedCount++;
          }
        }
      });

      const avgDays = reviewedCount > 0 ? Math.round(totalReviewDays / reviewedCount) : 0;
      const avgReviewTime = avgDays === 0 ? '< 1 day' : 
                           avgDays === 1 ? '1 day' : 
                           `${avgDays} days`;

      // Count reviews this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const reviewedThisMonth = abstracts?.filter(a => {
        if (!a.reviewed_date) return false;
        const reviewDate = new Date(a.reviewed_date);
        return reviewDate >= startOfMonth;
      }).length || 0;

      setMetrics({
        approvalRate: Math.round(approvalRate),
        avgReviewTime,
        totalReviewed: reviewed,
        reviewedThisMonth
      });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Performance</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getApprovalRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getApprovalRateBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Review Performance
        </CardTitle>
        <CardDescription>
          Quality metrics and review efficiency
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Approval Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Approval Rate</span>
            </div>
            <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getApprovalRateColor(metrics.approvalRate)}`}>
              {metrics.approvalRate}%
            </span>
          </div>
          <Progress 
            value={metrics.approvalRate} 
            className="h-3"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Average Review Time */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Avg Review Time</span>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {metrics.avgReviewTime}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Time from submission to review completion
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <TrendingUp className="w-4 h-4 text-purple-600 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{metrics.totalReviewed}</p>
            <p className="text-xs text-gray-600">Total Reviewed</p>
          </div>
          
          <div className="p-3 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <CheckCircle className="w-4 h-4 text-green-600 mb-1" />
            <p className="text-2xl font-bold text-gray-900">{metrics.reviewedThisMonth}</p>
            <p className="text-xs text-gray-600">This Month</p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Performance</span>
            {metrics.approvalRate >= 80 ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <Award className="w-4 h-4" />
                Excellent
              </span>
            ) : metrics.approvalRate >= 60 ? (
              <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                <TrendingUp className="w-4 h-4" />
                Good
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-semibold text-gray-600">
                <Clock className="w-4 h-4" />
                Needs Attention
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
