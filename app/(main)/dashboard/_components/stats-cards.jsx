'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, FileText, CheckCircle, Target, MessageCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getDashboardStats } from '@/lib/data-helpers';

export default function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.uid) return;
      
      try {
        const { stats: dashboardStats } = await getDashboardStats(user.uid);
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const careerStatsData = [
    {
      title: 'Profile Completion',
      value: `${stats?.profileCompletion || 0}%`,
      icon: CheckCircle,
      color: stats?.profileCompletion >= 80 ? 'text-green-500' : stats?.profileCompletion >= 50 ? 'text-yellow-500' : 'text-red-500'
    },
    {
      title: 'Documents Created',
      value: stats?.documentsCreated || 0,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Interview Sessions',
      value: stats?.interviewSessions || 0,
      icon: MessageCircle,
      color: 'text-purple-500'
    },
    {
      title: 'Latest Mock Score',
      value: stats?.latestMockScore ? `${stats.latestMockScore.toFixed(1)}/100` : 'N/A',
      icon: Target,
      color: stats?.latestMockScore >= 70 ? 'text-green-500' : stats?.latestMockScore >= 50 ? 'text-yellow-500' : 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {careerStatsData.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="bg-card border-border hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}