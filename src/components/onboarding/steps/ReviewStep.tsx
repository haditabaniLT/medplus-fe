import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { OnboardingStepProps } from '../../../types';
import { completeOnboardingAsync } from '../../../store/slices/onboardingSlice';
import { ROLE_OPTIONS, INDUSTRY_OPTIONS, SENIORITY_OPTIONS, FONT_OPTIONS } from '../../../constants/onboarding';
import Button from '../../ui/AntButton';
import { Check, Edit3 } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { message } from 'antd';

const ReviewStep: React.FC<OnboardingStepProps> = ({
  data,
  onBack,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.session);
  const { loading } = useSelector((state: RootState) => state.onboarding);

  const handleFinish = async () => {
    if (!user?.id) {
      message.error('User not authenticated');
      return;
    }

    try {
      const result = await dispatch(completeOnboardingAsync({
        userId: user.id,
        data: {
          fullName: data.role ? ROLE_OPTIONS.find(r => r.value === data.role)?.label : undefined,
          industry: data.industry,
          seniority: data.seniority,
          goals: data.goals,
          brandLogoUrl: data.logo ? 'uploaded' : undefined, // Logo URL is already saved
          brandPrimaryColor: data.primaryColor,
          brandSecondaryColor: data.secondaryColor,
          brandFont: data.font,
        }
      }));

      if (completeOnboardingAsync.fulfilled.match(result)) {
        message.success('Onboarding completed successfully!');
        navigate('/dashboard');
      } else {
        message.error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      message.error('Failed to complete onboarding');
    }
  };
  const getRoleLabel = () => {
    return ROLE_OPTIONS.find(option => option.value === data.role)?.label || data.role;
  };

  const getIndustryLabel = () => {
    return INDUSTRY_OPTIONS.find(option => option.value === data.industry)?.label || data.industry;
  };

  const getSeniorityLabel = () => {
    return SENIORITY_OPTIONS.find(option => option.value === data.seniority)?.label || data.seniority;
  };

  const getFontLabel = () => {
    const fontOption = FONT_OPTIONS.find(option => option.value === data.font);
    if (data.font === 'custom' && data.customFont) {
      return `Custom: ${data.customFont}`;
    }
    return fontOption?.label || data.font;
  };

  const ReviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Check className="h-4 w-4 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Review Your Setup
        </h2>
        <p className="text-muted-foreground mb-6">
          Everything looks good! Review your choices before we finish setting up your account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Role & Goals */}
        <ReviewSection title="Role & Goals">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-foreground">Role: </span>
              <span className="text-sm text-muted-foreground">{getRoleLabel()}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Goals: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.goals.map((goal, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ReviewSection>

        {/* Personalization */}
        <ReviewSection title="Personalization">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-foreground">Bio: </span>
              <p className="text-sm text-muted-foreground mt-1">{data.bio}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Industry: </span>
              <span className="text-sm text-muted-foreground">{getIndustryLabel()}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Experience: </span>
              <span className="text-sm text-muted-foreground">{getSeniorityLabel()}</span>
            </div>
          </div>
        </ReviewSection>

        {/* Brand Setup */}
        <ReviewSection title="Brand Setup">
          <div className="space-y-2">
            {data.logo ? (
              <div>
                <span className="text-sm font-medium text-foreground">Logo: </span>
                <div className="mt-2 inline-block">
                  <img
                    src={URL.createObjectURL(data.logo)}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain border border-border rounded bg-background p-2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-foreground">Logo: </span>
                <span className="text-sm text-muted-foreground">No logo uploaded</span>
              </div>
            )}
            
            {data.primaryColor && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Primary Color: </span>
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: data.primaryColor }}
                />
                <span className="text-sm text-muted-foreground">{data.primaryColor}</span>
              </div>
            )}
            
            {data.secondaryColor && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Secondary Color: </span>
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: data.secondaryColor }}
                />
                <span className="text-sm text-muted-foreground">{data.secondaryColor}</span>
              </div>
            )}
            
            {data.font && (
              <div>
                <span className="text-sm font-medium text-foreground">Font: </span>
                <span className="text-sm text-muted-foreground">{getFontLabel()}</span>
              </div>
            )}
          </div>
        </ReviewSection>
      </div>

      {/* Summary stats */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">Ready to get started!</h4>
        <p className="text-sm text-muted-foreground">
          Your personalized experience is ready. You can always update these settings later in your account preferences.
        </p>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="px-8 gap-2">
          <Edit3 className="h-4 w-4" />
          Back to Edit
        </Button>
        <Button onClick={handleFinish} variant="primary" className="px-8" loading={loading}>
          Finish Setup
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;