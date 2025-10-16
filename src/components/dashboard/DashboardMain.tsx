import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, Plus, Clock, AlertCircle, BarChart3, TrendingUp, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/AntButton';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import TaskGenerator from './TaskGenerator';
import UpgradeModal from '../modals/UpgradeModal';
import { getSupabaseAccessToken } from '@/utils/supabaseAuth';
import supabase from '@/supabase/supabaseClient';
import { useGetTasksQuery, useGetUsageQuery } from '../../store/api/taskApi';
import { Skeleton } from '../ui/skeleton';

const DashboardMain: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.session);
  const { activeCategory } = useSelector((state: RootState) => state.ui);
  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';
  const [showQuickTips, setShowQuickTips] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch recent tasks using the API
  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useGetTasksQuery({
    limit: 5,
    offset: 0,
    status: 'active',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Fetch usage data using the API
  const { 
    data: usageData, 
    isLoading: usageLoading, 
    error: usageError 
  } = useGetUsageQuery();

  const taskGeneratorRef = useRef<HTMLDivElement>(null);

  // Scroll to task generator when category is selected
  useEffect(() => {
    if (activeCategory && taskGeneratorRef.current) {
      taskGeneratorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCategory]);

  useEffect(() => {
    (async () => {
      supabase.auth.getSession().then(({ data }) => {
        console.log("======[data]=====",data)
      }).catch((error) => {
        console.log("======[error]=====", JSON.stringify(error, null, 1))
      })
    })()
  }, []);

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] flex">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Quick Tips */}
          {showQuickTips && (
            <Alert className="relative">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro tip:</strong> Use the task generator to create content 10x faster.
                Try describing what you need in natural language.
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => setShowQuickTips(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Analytics Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Tasks Generated Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Generated</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : usageError ? (
                  <div className="text-sm text-muted-foreground">Error loading</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {usageData?.usage.tasks_generated || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {usageData?.limits.tasks_generated || 0} limit
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Export Count Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : usageError ? (
                  <div className="text-sm text-muted-foreground">Error loading</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {usageData?.usage.export_count || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {usageData?.limits.export_limit || 0} limit
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Plan Status Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : usageError ? (
                  <div className="text-sm text-muted-foreground">Error loading</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {usageData?.plan || 'BASE'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {usageData?.plan === 'PRO' ? 'Unlimited access' : 'Upgrade for more'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Generator */}
          <div ref={taskGeneratorRef}>
            <TaskGenerator
              userPlan={userPlan}
              tasksUsed={usageData?.usage.tasks_generated || 0}
              maxTasks={usageData?.limits.tasks_generated || (userPlan === 'pro' ? 100 : 10)}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Your last 5 tasks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : tasksError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">Failed to load tasks</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : tasksData && tasksData.tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasksData.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Tasks
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">No tasks yet</p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
};

export default DashboardMain;