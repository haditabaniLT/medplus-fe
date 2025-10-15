import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OnboardingState, OnboardingData } from '../../types';
import { OnboardingService, OnboardingData as ServiceOnboardingData } from '../../services/onboardingService';
import { updateUserProfile } from './sessionSlice';

const initialState: OnboardingState = {
  currentStep: 1,
  isCompleted: false,
  data: {
    goals: [],
  },
  hasUnsavedChanges: false,
  loading: false,
};

// =====================================================
// ASYNC THUNKS
// =====================================================

// Complete onboarding
export const completeOnboardingAsync = createAsyncThunk(
  'onboarding/completeOnboarding',
  async ({ userId, data }: { userId: string; data: ServiceOnboardingData }, { rejectWithValue }) => {
    try {
      const success = await OnboardingService.completeOnboarding(userId, data);
      if (!success) {
        return rejectWithValue('Failed to complete onboarding');
      }
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Fetch user profile for onboarding
export const fetchUserProfileForOnboarding = createAsyncThunk(
  'onboarding/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const profile = await OnboardingService.fetchUserProfile(userId);
      if (!profile) {
        return rejectWithValue('Failed to fetch user profile');
      }
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Check onboarding status
export const checkOnboardingStatus = createAsyncThunk(
  'onboarding/checkStatus',
  async (userId: string, { rejectWithValue }) => {
    try {
      const isCompleted = await OnboardingService.checkOnboardingStatus(userId);
      return isCompleted;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Upload brand logo
export const uploadBrandLogoAsync = createAsyncThunk(
  'onboarding/uploadBrandLogo',
  async ({ userId, file }: { userId: string; file: File }, { rejectWithValue }) => {
    try {
      const logoUrl = await OnboardingService.uploadBrandLogo(userId, file);
      if (!logoUrl) {
        return rejectWithValue('Failed to upload brand logo');
      }
      return logoUrl;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update onboarding step
export const updateOnboardingStepAsync = createAsyncThunk(
  'onboarding/updateStep',
  async ({ userId, stepData }: { userId: string; stepData: Partial<ServiceOnboardingData> }, { rejectWithValue }) => {
    try {
      const success = await OnboardingService.updateOnboardingStep(userId, stepData);
      if (!success) {
        return rejectWithValue('Failed to update onboarding step');
      }
      return stepData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    updateOnboardingData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.data = { ...state.data, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
      state.hasUnsavedChanges = false;
    },
    previousStep: (state) => {
      state.currentStep -= 1;
    },
    completeOnboarding: (state) => {
      state.isCompleted = true;
      state.hasUnsavedChanges = false;
    },
    resetOnboarding: (state) => {
      return initialState;
    },
    saveStep: (state) => {
      state.hasUnsavedChanges = false;
    },
    setOnboardingData: (state, action: PayloadAction<OnboardingData>) => {
      state.data = action.payload;
    },
    clearError: (state) => {
      // Error handling is done in the async thunks
    },
  },
  extraReducers: (builder) => {
    builder
      // Complete onboarding
      .addCase(completeOnboardingAsync.pending, (state) => {
        state.loading = true;
        state.hasUnsavedChanges = true;
      })
      .addCase(completeOnboardingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isCompleted = true;
        state.hasUnsavedChanges = false;
        // Update data with the completed onboarding data
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(completeOnboardingAsync.rejected, (state) => {
        state.loading = false;
        state.hasUnsavedChanges = false;
      })
      
      // Fetch user profile
      .addCase(fetchUserProfileForOnboarding.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfileForOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        const profile = action.payload;
        // Populate onboarding data from user profile
        state.data = {
          role: profile.role || '',
          goals: Array.isArray(profile.goals) ? profile.goals : [],
          bio: profile.bio || '',
          industry: profile.industry || '',
          seniority: profile.seniority || '',
          primaryColor: profile.brand_primary_color || '#1ABC9C',
          secondaryColor: profile.brand_secondary_color || '#0B1D3A',
          font: profile.brand_font || 'Inter',
        };
      })
      .addCase(fetchUserProfileForOnboarding.rejected, (state) => {
        state.loading = false;
      })
      
      // Check onboarding status
      .addCase(checkOnboardingStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isCompleted = action.payload;
      })
      .addCase(checkOnboardingStatus.rejected, (state) => {
        state.loading = false;
      })
      
      // Upload brand logo
      .addCase(uploadBrandLogoAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadBrandLogoAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update the logo URL in the data
        state.data.logo = action.payload as any; // Store URL as string
      })
      .addCase(uploadBrandLogoAsync.rejected, (state) => {
        state.loading = false;
      })
      
      // Update onboarding step
      .addCase(updateOnboardingStepAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOnboardingStepAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.data = { ...state.data, ...action.payload };
        state.hasUnsavedChanges = false;
      })
      .addCase(updateOnboardingStepAsync.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  updateOnboardingData,
  setCurrentStep,
  nextStep,
  previousStep,
  completeOnboarding,
  resetOnboarding,
  saveStep,
  setOnboardingData,
  clearError,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;