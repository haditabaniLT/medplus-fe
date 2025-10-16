import React, { useState, useEffect } from 'react';
import ExportModal from '../components/export/ExportModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Filter, SortAsc, Download, Trash2, FolderInput, X, Lock } from 'lucide-react';
import { CATEGORIES, canAccessCategory } from '../constants/categories';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { Skeleton } from '../components/ui/skeleton';
import TaskCard from '../components/tasks/TaskCard';
import TasksEmptyState from '../components/tasks/TasksEmptyState';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { useGetTasksQuery } from '../store/api/taskApi';
import { Task } from '../types/task.types';


const Tasks = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.session);
  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';
  
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category'>('newest');
  const [showExportModal, setShowExportModal] = useState(false);
  const [taskToExport, setTaskToExport] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Build query parameters for the API
  const queryParams = {
    // Pagination
    limit: 20,
    offset: (page - 1) * 20,
    
    // Search and filters
    search: searchQuery || undefined,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // TODO: Support multiple categories
    status: 'active' as const,
    
    // Date range filters (convert from Date objects to ISO strings)
    fromDate: dateRange.from ? dateRange.from.toISOString().split('T')[0] : undefined,
    toDate: dateRange.to ? dateRange.to.toISOString().split('T')[0] : undefined,
    
    // Sorting (map UI sort options to API sort options)
    sortBy: sortBy === 'newest' ? 'created_at' : 
            sortBy === 'oldest' ? 'created_at' : 
            sortBy === 'category' ? 'category' : 'created_at',
    sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
    
    // Additional filters (can be extended later)
    // priority: undefined, // Can be added when priority filter is implemented
    // isFavorite: undefined, // Can be added when favorite filter is implemented
  };

  // Fetch tasks using the API
  const { 
    data: tasksData, 
    isLoading, 
    error,
    refetch 
  } = useGetTasksQuery(queryParams);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (tasksData?.hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tasksData?.hasMore, isLoading]);

  const displayedTasks = tasksData?.tasks || [];

  const toggleTaskSelection = (id: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTasks.size === displayedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(displayedTasks.map(t => t.id)));
    }
  };

  const toggleCategoryFilter = (category: string) => {
    const isLocked = !canAccessCategory(category, userPlan);
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDateRange({ from: undefined, to: undefined });
    setSortBy('newest');
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete with API
    console.log('Bulk delete tasks:', Array.from(selectedTasks));
    setSelectedTasks(new Set());
  };

  const handleBulkExport = () => {
    if (selectedTasks.size > 25) {
      alert('Bulk export is limited to 25 tasks at a time. Please select fewer tasks.');
      return;
    }
    console.log('Exporting tasks:', Array.from(selectedTasks));
    // TODO: Implement bulk export with API
  };

  const handleBulkMoveCategory = (newCategory: string) => {
    const isLocked = !canAccessCategory(newCategory, userPlan);
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    // TODO: Implement bulk move with API
    console.log('Moving tasks to category:', newCategory, Array.from(selectedTasks));
    setSelectedTasks(new Set());
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || dateRange.from || dateRange.to;

  return (
    <DashboardLayout>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your generated tasks
            </p>
          </div>
          {selectedTasks.size > 0 && (
            <Badge variant="secondary" className="text-sm">
              {selectedTasks.size} selected
            </Badge>
          )}
        </div>

        {/* Toolbar */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Filter by Category</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {CATEGORIES.map(category => {
                      const isLocked = !canAccessCategory(category, userPlan);
                      return (
                        <label 
                          key={category} 
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            isLocked && "opacity-60"
                          )}
                        >
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategoryFilter(category)}
                            disabled={isLocked}
                          />
                          <span className="text-sm flex-1">{category}</span>
                          {isLocked && <Lock className="h-3 w-3" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Date Range
                  {(dateRange.from || dateRange.to) && (
                    <Badge variant="secondary" className="ml-1">•</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="category">Category A→Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}

            {/* Bulk Actions */}
            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleBulkDelete} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FolderInput className="h-4 w-4" />
                      Move to
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-2">
                      {CATEGORIES.map(category => {
                        const isLocked = !canAccessCategory(category, userPlan);
                        return (
                          <button
                            key={category}
                            onClick={() => handleBulkMoveCategory(category)}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center justify-between",
                              isLocked && "opacity-60 cursor-not-allowed"
                            )}
                            disabled={isLocked}
                          >
                            <span>{category}</span>
                            {isLocked && <Lock className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Bulk Select Checkbox */}
          {displayedTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedTasks.size === displayedTasks.length && displayedTasks.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all {displayedTasks.length} tasks
              </span>
            </div>
          )}
        </div>

        {/* Task List */}
        {displayedTasks.length === 0 && !isLoading ? (
          error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Failed to load tasks. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <TasksEmptyState />
          )
        ) : (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  category: task.category,
                  createdAt: new Date(task.created_at),
                  summary: task.content.substring(0, 100) + '...',
                  body: task.content,
                  isPinned: false // TODO: Add isPinned to Task type
                }}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={() => toggleTaskSelection(task.id)}
                onDelete={() => {
                  // TODO: Implement delete with API
                  console.log('Delete task:', task.id);
                }}
                onDuplicate={() => {
                  // TODO: Implement duplicate with API
                  console.log('Duplicate task:', task.id);
                }}
                onPin={() => {
                  // TODO: Implement pin with API
                  console.log('Pin task:', task.id);
                }}
                onExport={() => {
                  setTaskToExport(task);
                  setShowExportModal(true);
                }}
              />
            ))}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </ScrollArea>

      {/* Export Modal */}
      {taskToExport && (
        <ExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          task={{
            id: taskToExport.id,
            title: taskToExport.title,
            category: taskToExport.category,
            summary: taskToExport.content.substring(0, 200) + '...',
            steps: [],
            content: taskToExport.content,
            createdAt: taskToExport.created_at,
            updatedAt: taskToExport.updated_at,
            wordCount: taskToExport.content.split(' ').length,
            sourceLanguage: 'English',
            tone: 'neutral',
          }}
          userPlan={userPlan}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </DashboardLayout>
  );
};

export default Tasks;
