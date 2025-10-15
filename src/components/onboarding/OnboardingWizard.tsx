import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { 
  updateOnboardingData, 
  nextStep, 
  previousStep, 
  completeOnboarding,
  saveStep,
  completeOnboardingAsync,
  fetchUserProfileForOnboarding,
  checkOnboardingStatus,
  updateOnboardingStepAsync
} from '../../store/slices/onboardingSlice';
import { updateUserProfile } from '../../store/slices/sessionSlice';
import { OnboardingData } from '../../types';
import RoleGoalsStep from './steps/RoleGoalsStep';
import PersonalizationStep from './steps/PersonalizationStep';
import BrandSetupStep from './steps/BrandSetupStep';
import ReviewStep from './steps/ReviewStep';
import { Card } from '../ui/Card';
import { Progress } from '../ui/progress';
import { OnboardingService } from '../../services/onboardingService';

const OnboardingWizard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { currentStep, data, hasUnsavedChanges, isCompleted } = useSelector((state: RootState) => state.onboarding);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.session);

  const totalSteps = 4;

  // =====================================================
  // INITIALIZATION & AUTH CHECK
  // =====================================================

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate('/login');
      return;
    }

    try {
      // Check onboarding status
      dispatch(checkOnboardingStatus(user.id));
      
      // Fetch user profile for prefilling data
      dispatch(fetchUserProfileForOnboarding(user.id));
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
    }
  }, [isAuthenticated, user?.id, navigate, dispatch]);

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (isCompleted) {
      navigate('/dashboard');
    }
  }, [isCompleted, navigate]);

  // =====================================================
  // AUTO-SAVE LOGIC - DISABLED (No persistence requested)
  // =====================================================
  // Removed auto-save logic as per user request

  // =====================================================
  // NAVIGATION GUARD
  // =====================================================

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return {
          fullName: data.bio || '', // Using bio field for full name
          industry: data.industry || '',
          seniority: data.seniority || '',
        };
      case 2:
        return {
          goals: data.goals || [],
        };
      case 3:
        return {
          brandPrimaryColor: data.primaryColor || '#1ABC9C',
          brandSecondaryColor: data.secondaryColor || '#0B1D3A',
          brandFont: data.font || 'Inter',
        };
      default:
        return null;
    }
  };

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const handleUpdate = (updates: Partial<OnboardingData>) => {
    dispatch(updateOnboardingData(updates));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      dispatch(previousStep());
    }
  };

  const handleFinish = async () => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Validate all data before completing
      const validation = OnboardingService.validateOnboardingData({
        fullName: data.bio || '', // Using bio field for full name
        industry: data.industry || '',
        seniority: data.seniority || '',
        goals: data.goals || [],
        brandPrimaryColor: data.primaryColor,
        brandSecondaryColor: data.secondaryColor,
        brandFont: data.font,
      });

      if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return;
      }

      // Complete onboarding
      const result = await dispatch(completeOnboardingAsync({
        userId: user.id,
        data: {
          fullName: data.bio || '',
          industry: data.industry || '',
          seniority: data.seniority || '',
          goals: data.goals || [],
          brandPrimaryColor: data.primaryColor,
          brandSecondaryColor: data.secondaryColor,
          brandFont: data.font,
        }
      }));

      // Update user's onboarding status in session
      if (completeOnboardingAsync.fulfilled.match(result)) {
        dispatch(updateUserProfile({ onboarding: true }));
        navigate('/dashboard');
      } else {
        console.error('Failed to complete onboarding:', result.payload);
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  };

  const getCanGoNext = () => {
    switch (currentStep) {
      case 1: // RoleGoalsStep
        return !!(data.role && data.goals && data.goals.length > 0);
      case 2: // PersonalizationStep  
        return !!(data.bio && data.industry && data.seniority);
      case 3: // BrandSetupStep
        return true; // Brand setup is optional
      case 4: // ReviewStep
        return true; // Review step
      default:
        return false;
    }
  };

  // =====================================================
  // RENDER FUNCTIONS
  // =====================================================

  const renderStep = () => {
    const stepProps = {
      data,
      onUpdate: handleUpdate,
      onNext: handleNext,
      onBack: handleBack,
      canGoNext: getCanGoNext(),
      currentStep,
      totalSteps,
    };

    switch (currentStep) {
      case 1:
        return <RoleGoalsStep {...stepProps} />;
      case 2:
        return <PersonalizationStep {...stepProps} />;
      case 3:
        return <BrandSetupStep {...stepProps} />;
      case 4:
        return <ReviewStep {...stepProps} />;
      default:
        return <RoleGoalsStep {...stepProps} />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Goals & Intent';
      case 3:
        return 'Brand Setup';
      case 4:
        return 'Review & Complete';
      default:
        return 'Setup';
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  if (!isAuthenticated || !user?.id) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Welcome to MePlus.ai!</h1>
          <p className="text-muted-foreground">Let's get you set up in just a few steps</p>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{getStepTitle()}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        <Card className="p-8">
          {renderStep()}
        </Card>

        {hasUnsavedChanges && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Saving changes...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;