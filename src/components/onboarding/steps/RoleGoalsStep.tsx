import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OnboardingStepProps } from '../../../types';
import { ROLE_OPTIONS, GOAL_OPTIONS } from '../../../constants/onboarding';
import Dropdown from '../../ui/Dropdown';
import TextInput from '../../ui/TextInput';
import Button from '../../ui/AntButton';
import { X } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { updateOnboardingStepAsync } from '../../../store/slices/onboardingSlice';

const RoleGoalsStep: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  canGoNext,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save disabled as per user request
  // useEffect(() => { ... }, [data.role, data.goals, user?.id, dispatch]);

  const handleRoleChange = (value: string | number) => {
    onUpdate({ role: value as string });
  };

  const handleGoalToggle = (goal: string) => {
    const newGoals = data.goals.includes(goal)
      ? data.goals.filter(g => g !== goal)
      : [...data.goals, goal];
    onUpdate({ goals: newGoals });
  };

  const handleAddCustomGoal = () => {
    if (customGoalInput.trim() && customGoalInput.length <= 200) {
      const newGoals = [...data.goals, customGoalInput.trim()];
      onUpdate({ goals: newGoals });
      setCustomGoalInput('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    const newGoals = data.goals.filter(g => g !== goalToRemove);
    onUpdate({ goals: newGoals });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomGoal();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          What's your role?
        </h2>
        <p className="text-muted-foreground mb-6">
          Help us understand how you'll be using our platform
        </p>
        
        <Dropdown
          label="Select your role"
          options={ROLE_OPTIONS}
          value={data.role}
          onChange={handleRoleChange}
          placeholder="Choose your role..."
          className="max-w-md"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          What are your main goals?
        </h3>
        <p className="text-muted-foreground mb-4">
          Select all that apply or add your own
        </p>

        {/* Goal chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalToggle(goal)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                data.goals.includes(goal)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        {/* Selected custom goals */}
        {data.goals.filter(goal => !GOAL_OPTIONS.includes(goal)).length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-2">Your custom goals:</p>
            <div className="flex flex-wrap gap-2">
              {data.goals
                .filter(goal => !GOAL_OPTIONS.includes(goal))
                .map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                  >
                    <span>{goal}</span>
                    <button
                      onClick={() => handleRemoveGoal(goal)}
                      className="hover:bg-primary/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Custom goal input */}
        <div className="flex gap-2">
          <TextInput
            placeholder="Add a custom goal..."
            value={customGoalInput}
            onChange={setCustomGoalInput}
            maxLength={200}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleAddCustomGoal}
            disabled={!customGoalInput.trim() || customGoalInput.length > 200}
            variant="outline"
          >
            Add
          </Button>
        </div>
        {customGoalInput.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {customGoalInput.length}/200 characters
          </p>
        )}
      </div>

      {/* Selected goals count */}
      {data.goals.length > 0 && (
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {data.goals.length} goal{data.goals.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default RoleGoalsStep;