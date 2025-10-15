import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OnboardingStepProps } from '../../../types';
import { INDUSTRY_OPTIONS, SENIORITY_OPTIONS } from '../../../constants/onboarding';
import Dropdown from '../../ui/Dropdown';
import { Textarea } from '../../ui/textarea';
import Button from '../../ui/AntButton';
import { RootState, AppDispatch } from '../../../store';
import { updateOnboardingStepAsync } from '../../../store/slices/onboardingSlice';

const PersonalizationStep: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  canGoNext,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save disabled as per user request
  // useEffect(() => { ... }, [data.bio, data.industry, data.seniority, user?.id, dispatch]);
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ bio: e.target.value });
  };

  const handleIndustryChange = (value: string | number) => {
    onUpdate({ industry: value as string });
  };

  const handleSeniorityChange = (value: string | number) => {
    onUpdate({ seniority: value as string });
  };

  const bioLength = data.bio?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground mb-6">
          Help us personalize your experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Short Bio
            <span className="text-destructive ml-1">*</span>
          </label>
          <Textarea
            placeholder="Tell us a bit about yourself, your background, and what you're looking to achieve..."
            value={data.bio || ''}
            onChange={handleBioChange}
            maxLength={280}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Share your background and what you're hoping to accomplish
            </p>
            <p className={`text-xs ${bioLength > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {bioLength}/280
            </p>
          </div>
        </div>

        {/* Industry */}
        <Dropdown
          label="Industry"
          options={INDUSTRY_OPTIONS}
          value={data.industry}
          onChange={handleIndustryChange}
          placeholder="Select your industry..."
          className="max-w-md"
        />

        {/* Seniority */}
        <Dropdown
          label="Experience Level"
          options={SENIORITY_OPTIONS}
          value={data.seniority}
          onChange={handleSeniorityChange}
          placeholder="Select your experience level..."
          className="max-w-md"
        />
      </div>

      {/* Progress indicator */}
      <div className="bg-muted p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${data.bio ? 'bg-primary' : 'bg-muted-foreground'}`} />
          <span className="text-sm">Bio</span>
          
          <div className={`w-3 h-3 rounded-full ${data.industry ? 'bg-primary' : 'bg-muted-foreground'}`} />
          <span className="text-sm">Industry</span>
          
          <div className={`w-3 h-3 rounded-full ${data.seniority ? 'bg-primary' : 'bg-muted-foreground'}`} />
          <span className="text-sm">Experience</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8"
        >
          Back
        </Button>
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

export default PersonalizationStep;