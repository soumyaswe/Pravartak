'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import WelcomeHeader from './welcome-header';
import ActionPlan from './action-plan';
import CareerRoadmap from './career-roadmap';
import CareerVitals from './career-vitals';
import RecentActivity from './recent-activity';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardView() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard/stats?userId=${user.uid}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDashboardData(data.stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <Alert>
        <AlertDescription>
          No dashboard data available. Start by creating your profile!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Column - 70% width on large screens */}
      <div className="lg:col-span-2 space-y-4">
        {/* Welcome & Next Recommended Action */}
        <WelcomeHeader data={dashboardData} />
        
        {/* Your Action Plan (AI Recommendations) */}
        <ActionPlan data={dashboardData} />
        
        {/* Your Career Roadmap */}
        <CareerRoadmap data={dashboardData} />
      </div>
      
      {/* Right Sidebar - 30% width on large screens */}
      <div className="lg:col-span-1 space-y-4">
        {/* Career Vitals (Key Metrics) */}
        <CareerVitals data={dashboardData} />
        
        {/* Recent Activity */}
        <RecentActivity data={dashboardData} />
      </div>
    </div>
  );
}