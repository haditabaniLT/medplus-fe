import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, ThumbsUp, ThumbsDown, Download, RefreshCw, Save, Copy, Sparkles, X, Bookmark, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { CATEGORIES, DEFAULT_CATEGORY, canAccessCategory } from '../../constants/categories';
import { TaskCategory } from '../../types/task.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import Button from '../ui/AntButton';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import SaveTemplateModal from './SaveTemplateModal';
import { useCreateTaskMutation } from '../../store/api/taskApi';
import { formatOpenAIText } from '@/utils/quotaHelpers';

interface GeneratedTask {
  title: string;
  category: string;
  summary: string;
  steps: string[];
  metadata: {
    keywords: string[];
    goals: string[];
  };
}

const categories = CATEGORIES.map(cat => ({
  value: cat,
  label: cat,
}));

const tones = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
];

const aiModels = [
  { value: 'grok', label: 'Grok' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI (GPT)' },
];

interface TaskGeneratorProps {
  userPlan: 'base' | 'pro';
  tasksUsed: number;
  maxTasks: number;
  onUpgrade?: () => void;
}

const TaskGenerator: React.FC<TaskGeneratorProps> = ({ userPlan, tasksUsed, maxTasks, onUpgrade }) => {
  const { toast } = useToast();
  const location = useLocation();
  const activeCategory = useSelector((state: RootState) => state.ui.activeCategory);
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [category, setCategory] = useState<TaskCategory>(activeCategory || DEFAULT_CATEGORY);
  const [tone, setTone] = useState('neutral');
  const [language, setLanguage] = useState('en');
  const [aiModel, setAiModel] = useState('openai');
  const [optimizePrompt, setOptimizePrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [generatedTask, setGeneratedTask] = useState<GeneratedTask | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentInput = activeTab === 'text' ? inputText : voiceTranscript;
  const charCount = currentInput.length;
  const isOverLimit = charCount > 4000;
  const canGenerate = currentInput.trim().length > 0 && !isOverLimit && !isGenerating && !isCreatingTask;
  const quotaExceeded = tasksUsed >= maxTasks && userPlan === 'base';

  // Sync category with Redux state
  useEffect(() => {
    if (activeCategory) {
      setCategory(activeCategory);
    }
  }, [activeCategory]);

  // Apply template from navigation state
  useEffect(() => {
    if (location.state) {
      const { templateContent, templateTone, templateLanguage } = location.state as any;
      if (templateContent) {
        setInputText(templateContent);
        setActiveTab('text');
      }
      if (templateTone) {
        setTone(templateTone);
      }
      if (templateLanguage) {
        setLanguage(templateLanguage);
      }
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Voice input not supported',
        description: 'Your browser does not support voice input.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsRecording(true);
        toast({ title: 'Listening...', description: 'Start speaking to generate your task.' });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);

        if (event.error === 'not-allowed') {
          toast({
            title: 'Microphone access denied',
            description: 'Please enable microphone permissions in your browser settings.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Voice input error',
            description: 'An error occurred with voice input. Please try again.',
            variant: 'destructive',
          });
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast({
        title: 'Voice input error',
        description: 'Failed to start voice input. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    const isLocked = !canAccessCategory(value, userPlan);
    if (isLocked && onUpgrade) {
      onUpgrade();
      return;
    }
    setCategory(value as TaskCategory);
  };

  const handleGenerate = async () => {
    console.log("======[HANDLE GENERATE]=====")
    if (!canGenerate) return;

    setIsGenerating(true);
    setGenerationTime(0);
    setGeneratedTask(null);
    setFeedback(null);

    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      // Create task data for API
      const taskData = {
        category: category,
        title: `Generated Task: ${currentInput.slice(0, 50)}${currentInput.length > 50 ? '...' : ''}`,
        prompt: `${currentInput}`,
        priority: 'medium' as const,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'pending' as const,
        tags: [],
        type: 'generated' as const,
        ai_model: aiModel,
        optimize_prompt: optimizePrompt,
        metadata: {
          tone: tone,
          language: language,
          generatedAt: new Date().toISOString(),
        },
      };

      const result = await createTask(taskData).unwrap();

      if (timerRef.current) clearInterval(timerRef.current);

      // Convert API response to GeneratedTask format for display
      const generatedTaskData: GeneratedTask = {
        title: result.title,
        category: result.category,
        summary: result.content,
        steps: [
          'Review the input requirements and objectives',
          'Create an action plan with clear milestones',
          'Execute the task following best practices',
          'Review and iterate based on feedback',
          'Document the results and learnings',
        ],
        metadata: {
          keywords: ['productivity', 'automation', 'efficiency'],
          goals: ['Complete task efficiently', 'Maintain quality standards', 'Meet deadlines'],
        },
      };

      setGeneratedTask(generatedTaskData);
      setIsGenerating(false);

      toast({
        title: 'Task generated and saved successfully',
        description: 'Your task has been generated and saved to your tasks list.',
      });

    } catch (error: any) {
      console.error('Error generating task:', error);

      if (timerRef.current) clearInterval(timerRef.current);
      setIsGenerating(false);

      toast({
        title: 'Failed to generate task',
        description: error?.data?.message || 'An error occurred while generating your task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClear = () => {
    setInputText('');
    setVoiceTranscript('');
    setGeneratedTask(null);
    setFeedback(null);
    setGenerationTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    console.log("======[HANDLE SAVE]=====")
    if (quotaExceeded) {
      toast({
        title: 'Quota exceeded',
        description: 'You have reached your monthly task limit. Upgrade to Pro for unlimited tasks.',
        variant: 'destructive',
      });
      return;
    }

    if (!generatedTask) {
      toast({
        title: 'No task to save',
        description: 'Please generate a task first before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const taskData = {
        category: generatedTask.category,
        title: generatedTask.title,
        content: generatedTask.summary, // Using summary as content since API expects content field
      };

      const result = await createTask(taskData).unwrap();

      toast({
        title: 'Task saved successfully',
        description: 'Your task has been saved and is now available in your tasks list.',
      });

      // Clear the generated task after successful save
      setGeneratedTask(null);

    } catch (error: any) {
      console.error('Error saving task:', error);

      toast({
        title: 'Failed to save task',
        description: error?.data?.message || 'An error occurred while saving your task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedTask) return;

    const text = `${generatedTask.title}\n\nSummary: ${generatedTask.summary}\n\nSteps:\n${generatedTask.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);

    toast({
      title: 'Copied to clipboard',
      description: 'Task details have been copied.',
    });
  };

  const handleExport = (format: string) => {
    if (quotaExceeded) {
      toast({
        title: 'Quota exceeded',
        description: 'Export is only available with Copy to clipboard when quota is exceeded.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: `Exporting to ${format}`,
      description: `Your task is being exported to ${format} format.`,
    });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({
      title: 'Thank you for your feedback',
      description: 'Your feedback helps us improve the task generator.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Task Generator
        </CardTitle>
        <CardDescription>
          Create tasks using text or voice input with AI assistance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'voice')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="voice">Voice Input</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-2">
            <Textarea
              placeholder="Describe your task in detail... (e.g., 'Create a marketing campaign for a new product launch')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={4000}
            />
            <div className="flex justify-end">
              <span className={`text-sm ${isOverLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {charCount} / 4000
              </span>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>

            {voiceTranscript && (
              <div className="space-y-2">
                <Label>Transcript (editable)</Label>
                <Textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={4000}
                />
                <div className="flex justify-end">
                  <span className={`text-sm ${voiceTranscript.length > 4000 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {voiceTranscript.length} / 4000
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Controls Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const isLocked = !canAccessCategory(cat.value, userPlan);
                  return (
                    <SelectItem key={cat.value} value={cat.value} disabled={isLocked}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cat.label}</span>
                        {isLocked && <Lock className="h-3 w-3 ml-2" />}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Optimize Prompt
              {userPlan === 'base' && <Badge variant="secondary" className="text-xs">Pro</Badge>}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 h-10">
                    <Switch
                      checked={optimizePrompt}
                      onCheckedChange={(checked) => {
                        if (userPlan === 'base') {
                          toast({
                            title: 'Pro Feature',
                            description: 'Prompt optimization is available on Pro plan only.',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setOptimizePrompt(checked);
                      }}
                      disabled={userPlan === 'base'}
                    />
                    <span className="text-sm text-muted-foreground">
                      {optimizePrompt ? 'On' : 'Off'}
                    </span>
                  </div>
                </TooltipTrigger>
                {userPlan === 'base' && (
                  <TooltipContent>
                    <p>Available on Pro plan</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="flex-1"
          >
            {(isGenerating || isCreatingTask) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating{generationTime > 0 && ` (${generationTime}s)`}
              </>
            ) : (
              <div className='flex items-center gap-2'>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSaveTemplateModal(true)}
            disabled={!currentInput.trim()}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save as Template
          </Button>
          {currentInput.trim() && (
            <Button variant="outline" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {(isGenerating || isCreatingTask) && generationTime > 30 && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Taking longer than expected...
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setIsGenerating(false);
                if (timerRef.current) clearInterval(timerRef.current);
                toast({ title: 'Generation cancelled' });
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Output Pane */}
        {generatedTask && (
          <>
            <Separator />
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="text-lg font-semibold">{generatedTask.title}</h3>
                  <Badge variant="outline">{generatedTask.category}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant={feedback === 'up' ? 'default' : 'ghost'}
                    onClick={() => handleFeedback('up')}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={feedback === 'down' ? 'destructive' : 'ghost'}
                    onClick={() => handleFeedback('down')}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <div  dangerouslySetInnerHTML={{ __html: formatOpenAIText(generatedTask.summary) }} />
              </div>

              <div className="space-y-2">
                <Label>Actionable Steps</Label>
                <ol className="space-y-2">
                  {generatedTask.steps.map((step, index) => (
                    <li key={index} className="text-sm flex gap-2">
                      <span className="font-medium text-primary">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedTask.metadata.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedTask.metadata.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Output Actions */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button onClick={handleSave} disabled={quotaExceeded || isCreatingTask}>
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Already Saved
                    </>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={quotaExceeded}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('PDF')}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Canva')}>
                      Export to Canva
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('Gamma')}>
                      Export to Gamma
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" onClick={handleGenerate}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>

                <Button variant="outline" onClick={handleCopyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>

              {quotaExceeded && (
                <div className="p-3 border border-warning bg-warning/5 rounded-lg">
                  <p className="text-sm text-warning">
                    You have reached your monthly task limit. Only Copy to clipboard is available. Upgrade to Pro for unlimited tasks.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        content={currentInput}
        category={category}
        tone={tone as 'neutral' | 'professional' | 'friendly' | 'concise'}
        language={language}
      />
    </Card>
  );
};

export default TaskGenerator;