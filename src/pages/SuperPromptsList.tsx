import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import SuperPromptCard from '../components/super-prompts/SuperPromptCard';
import { cn } from '../lib/utils';

// Mock data - replace with actual API call
const mockSuperPrompts = [
  {
    id: '1',
    title: 'Project Kickoff Email',
    category: 'Influence Builder',
    task: "Draft a project kickoff email for the new 'Zenith' app design",
    tone: 'Professional & Friendly',
    audience: 'The project team',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Team Rally Message',
    category: 'Team Ignition',
    task: 'Create an inspiring message to rally the development team',
    tone: 'Motivational',
    audience: 'Development team',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: 'Strategic Decision Analysis',
    category: 'Decision Mastery',
    task: 'Analyze whether to approve the new marketing budget proposal',
    tone: 'Formal',
    audience: 'Executive team',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const categories = [
  'All Categories',
  'Decision Mastery',
  'Influence Builder',
  'Team Ignition',
  'Mindset Recharge',
  'Network Catalyst',
  'Play Time',
  'Other/Custom',
];

const SuperPromptsList: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.session);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Filter prompts based on search and category
  const filteredPrompts = mockSuperPrompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    navigate('/super-prompts/create');
  };

  const handleCardClick = (id: string) => {
    // TODO: Navigate to prompt detail page
    console.log('View prompt:', id);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Super Prompts</h1>
              <p className="text-muted-foreground">
                Manage and view all your created super prompts
              </p>
            </div>
            <Button onClick={handleCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Super Prompt
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
          </div>

          {/* Prompts Grid */}
          {filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <SuperPromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  category={prompt.category}
                  task={prompt.task}
                  tone={prompt.tone}
                  audience={prompt.audience}
                  createdAt={prompt.createdAt}
                  onClick={() => handleCardClick(prompt.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'All Categories' ? (
                  <>
                    <p className="text-lg font-medium mb-2">No prompts found</p>
                    <p className="text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No super prompts yet</p>
                    <p className="text-sm mb-4">
                      Create your first super prompt to get started
                    </p>
                    <Button onClick={handleCreateNew} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Prompt
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperPromptsList;



