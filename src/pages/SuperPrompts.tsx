import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
  GraduationCap,
  Megaphone,
  Users as UsersIcon,
  Heart,
  TrendingUp,
  Palette as PaletteIcon,
  Briefcase,
  Edit,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../lib/utils';
import TextInput from '../components/ui/TextInput';
import { Textarea } from '../components/ui/textarea';
import Dropdown from '../components/ui/Dropdown';
import LivePreview from '../components/super-prompts/LivePreview';
import FormattedOutput from '../components/super-prompts/FormattedOutput';
import { Button } from '../components/ui/button';
import { getSupabaseTokenForAPI } from '../utils/supabaseAuth';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  questions: Question[];
}

interface Question {
  id: string;
  label: string;
  text: string;
  type: 'core' | 'next-best' | 'optional';
}

const SuperPrompts: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.session);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    task: '',
    tone: '',
    deadline: '',
    audience: '',
  });
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [showOutput, setShowOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const categories: Category[] = [
    {
      id: 'decision-mastery',
      name: 'Decision Mastery',
      icon: GraduationCap,
      description: 'Strategic calls e.g., "Approve project?"',
      questions: [
        {
          id: 'goal',
          label: 'Goal',
          text: "What's your goal in 1 sentence?",
          type: 'core',
        },
        {
          id: 'risks',
          label: 'Risks',
          text: 'What risks do you see? (Based on your bio\'s industry experience...)',
          type: 'next-best',
        },
        {
          id: 'success',
          label: 'Success Measurement',
          text: 'How will you measure success?',
          type: 'next-best',
        },
        {
          id: 'constraints',
          label: 'Constraints',
          text: 'Any key constraints (e.g., budget, time)?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'influence-builder',
      name: 'Influence Builder',
      icon: Megaphone,
      description: 'Emails/pitches/presentations e.g., "Persuade boss?"',
      questions: [
        {
          id: 'message',
          label: 'Key Message',
          text: "What's your key message in 1 sentence?",
          type: 'core',
        },
        {
          id: 'audience',
          label: 'Audience',
          text: 'Who\'s the audience (e.g., boss, client)? (Drawing from your bio\'s role and experience...)',
          type: 'next-best',
        },
        {
          id: 'outcome',
          label: 'Desired Outcome',
          text: 'What outcome do you want?',
          type: 'next-best',
        },
        {
          id: 'tone',
          label: 'Emotional Tone',
          text: 'Any emotional tone (e.g., confident, empathetic)?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'team-ignition',
      name: 'Team Ignition',
      icon: UsersIcon,
      description: 'Motivation/rally e.g., "Rally team?"',
      questions: [
        {
          id: 'goal',
          label: 'Team Goal',
          text: "What's the team's goal in 1 sentence?",
          type: 'core',
        },
        {
          id: 'mood',
          label: 'Current Mood',
          text: 'What\'s the current mood (e.g., motivated, frustrated)? (Based on your leadership style from bio...)',
          type: 'next-best',
        },
        {
          id: 'action',
          label: 'Desired Action',
          text: 'What action do you want from them?',
          type: 'next-best',
        },
        {
          id: 'challenges',
          label: 'Challenges',
          text: 'Any challenges (e.g., remote team)?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'mindset-recharge',
      name: 'Mindset Recharge',
      icon: Heart,
      description: 'Reflection e.g., "Overcome doubt?"',
      questions: [
        {
          id: 'emotion',
          label: 'Current Emotion',
          text: "What's your current emotion in 1 sentence?",
          type: 'core',
        },
        {
          id: 'trigger',
          label: 'Trigger',
          text: 'What triggered it (e.g., meeting)? (Drawing from your bio\'s role and challenges...)',
          type: 'next-best',
        },
        {
          id: 'outcome',
          label: 'Desired Outcome',
          text: 'What outcome do you want?',
          type: 'next-best',
        },
        {
          id: 'mindset-shifts',
          label: 'Mindset Shifts',
          text: 'Any mindset shifts needed?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'network-catalyst',
      name: 'Network Catalyst',
      icon: TrendingUp,
      description: 'Connections e.g., "Build alliances?"',
      questions: [
        {
          id: 'goal',
          label: 'Networking Goal',
          text: "What's your networking goal in 1 sentence?",
          type: 'core',
        },
        {
          id: 'target',
          label: 'Target',
          text: 'Who\'s the target (e.g., industry exec)? (From your bio\'s network and experience...)',
          type: 'next-best',
        },
        {
          id: 'value',
          label: 'Value Offered',
          text: 'What value do you offer?',
          type: 'next-best',
        },
        {
          id: 'follow-up',
          label: 'Follow-up Plan',
          text: 'Follow-up plan?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'play-time',
      name: 'Play Time',
      icon: PaletteIcon,
      description: 'Relaxation e.g., "Vacations/fitness?"',
      questions: [
        {
          id: 'goal',
          label: 'Play Goal',
          text: "What's your play goal in 1 sentence?",
          type: 'core',
        },
        {
          id: 'preferences',
          label: 'Preferences',
          text: 'Preferences (e.g., solo/group)? (Based on your bio\'s style and lifestyle...)',
          type: 'next-best',
        },
        {
          id: 'constraints',
          label: 'Constraints',
          text: 'Constraints (e.g., time)?',
          type: 'next-best',
        },
        {
          id: 'restorative',
          label: 'Restorative Approach',
          text: 'How to make it restorative?',
          type: 'optional',
        },
      ],
    },
    {
      id: 'other-custom',
      name: 'Other/Custom',
      icon: Briefcase,
      description: 'Ad-hoc tasks e.g., "Brainstorm strategy?"',
      questions: [
        {
          id: 'goal',
          label: 'Custom Goal',
          text: "What's your custom goal in 1 sentence?",
          type: 'core',
        },
        {
          id: 'details',
          label: 'Key Details',
          text: 'Key details or context? (Based on your bio\'s role/industry...)',
          type: 'next-best',
        },
        {
          id: 'format',
          label: 'Output Format',
          text: 'Desired output format (e.g., report, list)?',
          type: 'next-best',
        },
        {
          id: 'constraints',
          label: 'Constraints/Preferences',
          text: 'Any constraints or preferences?',
          type: 'optional',
        },
      ],
    },
  ];

  const toneOptions = [
    { label: 'Professional & Friendly', value: 'professional-friendly' },
    { label: 'Formal', value: 'formal' },
    { label: 'Casual', value: 'casual' },
    { label: 'Confident', value: 'confident' },
    { label: 'Empathetic', value: 'empathetic' },
    { label: 'Persuasive', value: 'persuasive' },
    { label: 'Motivational', value: 'motivational' },
  ];

  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);

  // Get user role and industry from user profile
  const userRole = (user as any)?.role || 'professional';
  const userIndustry = (user as any)?.industry || undefined;

  const handleQuestionChange = (questionId: string, value: string) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleGenerate = async () => {
    // Reset error state
    setError(null);
    setIsGenerating(true);
    setShowOutput(false);
    
    try {
      // Get Supabase access token
      const tokenData = await getSupabaseTokenForAPI();
      
      if (!tokenData) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Build API request body with only non-null/undefined values
      const questions: Record<string, string> = {};
      
      // Filter question answers to only include those with values
      Object.entries(questionAnswers).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value.trim() !== '') {
          questions[key] = value;
        }
      });

      // Build request body according to API spec
      const requestBody: Record<string, any> = {
        provided_prompt: formData.task, // Required field
        provided_ai_model: 'openai', // Default to openai, can be made configurable later
      };

      // Add category fields if available
      if (selectedCategory) {
        requestBody.category_id = selectedCategory;
      }
      if (selectedCategoryData?.name) {
        requestBody.category_name = selectedCategoryData.name;
      }

      // Add form fields only if they have values
      if (formData.task && formData.task.trim() !== '') {
        requestBody.task = formData.task;
      }
      if (formData.tone && formData.tone.trim() !== '') {
        requestBody.tone = formData.tone;
      }
      if (formData.deadline && formData.deadline.trim() !== '') {
        requestBody.deadline = formData.deadline;
      }
      if (formData.audience && formData.audience.trim() !== '') {
        requestBody.audience = formData.audience;
      }

      // Add questions object only if it has values
      if (Object.keys(questions).length > 0) {
        requestBody.questions = questions;
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      // Console log the request body for debugging
      console.log('=== Generate Button Pressed - API Request Body ===');
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('================================================');

      // Make API call to Super Prompt endpoint
      const response = await fetch(
        `${supabaseUrl}/functions/v1/tasks-api/super-prompt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate super prompt');
      }

      // Check if response has success flag
      if (result.success === false) {
        throw new Error(result.error || 'Failed to generate super prompt');
      }

      // Extract generated prompt and ID from response
      if (result.data?.generated_prompt) {
        setGeneratedContent(result.data.generated_prompt);
        if (result.data.id) {
          setPromptId(result.data.id);
        }
        setShowOutput(true);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err: any) {
      console.error('Error generating super prompt:', err);
      setError(err.message || 'An error occurred while generating the prompt');
      setShowOutput(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    // The prompt is already saved in the database with promptId
    console.log('Saving prompt:', generatedContent);
    console.log('Prompt ID:', promptId);
    // After saving, redirect to list page
    setTimeout(() => {
      navigate('/super-prompts');
    }, 500);
  };

  const handleEditInputs = () => {
    setShowOutput(false);
    setError(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/super-prompts')}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Super Prompts
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Super Prompt</h1>
            <p className="text-muted-foreground">
              Select a category and fill in the details to generate your super prompt
            </p>
          </div>

        {/* Category Tabs Grid - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'p-6 rounded-lg border-2 transition-all text-left',
                  'hover:border-primary hover:shadow-md',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Preview - Show when category is selected */}
        {selectedCategoryData && !showOutput && (
          <div className="mb-6">
            <LivePreview
              role={userRole}
              industry={userIndustry}
              task={formData.task}
              tone={formData.tone}
              audience={formData.audience}
              categoryName={selectedCategoryData.name}
            />
          </div>
        )}

        {/* Form Section - Only show when category is selected and not showing output */}
        {selectedCategoryData && !showOutput && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {selectedCategoryData.name}
            </h2>

            {/* Main Form Inputs */}
            {/* Task Input - Single Column Textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Task Input <span className="text-destructive ml-1">*</span>
              </label>
              <Textarea
                placeholder="Enter the task (e.g., Draft a project kickoff email for the new 'Zenith' app design)"
                value={formData.task}
                onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            {/* Other Inputs - Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Tone Selection"
                placeholder="Select tone (e.g., Professional & Friendly)"
                options={toneOptions}
                value={formData.tone}
                onChange={(value) => setFormData((prev) => ({ ...prev, tone: value as string }))}
              />

              <TextInput
                label="Deadline Input"
                placeholder="Enter deadline (e.g., Next Monday, EOD)"
                value={formData.deadline}
                onChange={(value) => setFormData((prev) => ({ ...prev, deadline: value }))}
              />

              <TextInput
                label="Audience Input"
                placeholder="Enter audience (e.g., The project team)"
                value={formData.audience}
                onChange={(value) => setFormData((prev) => ({ ...prev, audience: value }))}
              />
            </div>

            {/* Questions Section */}
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Questions</h3>
              <div className="space-y-6">
                {selectedCategoryData.questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          question.type === 'core'
                            ? 'bg-primary/20 text-primary'
                            : question.type === 'next-best'
                            ? 'bg-blue-500/20 text-blue-600'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {question.type === 'core'
                          ? 'Core'
                          : question.type === 'next-best'
                          ? 'Next-Best'
                          : 'Optional'}
                      </span>
                    </div>
                    <TextInput
                      label={question.label}
                      placeholder={`Enter ${question.label.toLowerCase()}`}
                      value={questionAnswers[question.id] || ''}
                      onChange={(value) => handleQuestionChange(question.id, value)}
                      required={question.type === 'core'}
                    />
                    <p className="text-sm text-muted-foreground ml-1">{question.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.task}
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isGenerating ? 'Generating...' : 'Generate Super Prompt'}
              </Button>
            </div>
          </div>
        )}

        {/* Output Section - Show when output is generated */}
        {showOutput && selectedCategoryData && (
          <div className="space-y-6">
            <FormattedOutput
              content={generatedContent}
              isLoading={isGenerating}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
            />
            
            {/* Edit Inputs Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleEditInputs}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Inputs
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperPrompts;

