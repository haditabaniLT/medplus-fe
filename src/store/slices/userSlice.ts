import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BrandPreferences, NotificationPreferences, UserService } from '../../services/userService';

// =====================================================
// SIMPLIFIED TYPES FOR REDUX
// =====================================================

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  plan: string;
  onboarding: boolean;
  goals: string[];
  industry?: string;
  seniority?: string;
  brand_logo_url?: string;
  brand_primary_color?: string;
  brand_secondary_color?: string;
  brand_font?: string;
  preferences: any;
  integrations: any;
  usage: any;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme?: 'dark' | 'light';
  language?: string;
  timezone?: string;
  notifications?: {
    inApp?: boolean;
    email?: boolean;
  };
}

export interface UserIntegrations {
  canva?: boolean;
  gamma?: boolean;
}

// =====================================================
// USER SLICE - Enhanced with Brand & Notification Management
// =====================================================

export interface UserState {
  profile: UserProfile | null;
  brandPreferences: BrandPreferences | null;
  notificationPreferences: NotificationPreferences | null;
  accountInfo: {
    email: string;
    email_verified: boolean;
    plan: string;
  } | null;
  loading: {
    profile: boolean;
    brandPreferences: boolean;
    notificationPreferences: boolean;
    accountInfo: boolean;
    saving: boolean;
  };
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  brandPreferences: null,
  notificationPreferences: null,
  accountInfo: null,
  loading: {
    profile: false,
    brandPreferences: false,
    notificationPreferences: false,
    accountInfo: false,
    saving: false,
  },
  error: null,
};

// =====================================================
// ASYNC THUNKS
// =====================================================

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const profile = await UserService.getUserProfile(userId);
      if (!profile) {
        return rejectWithValue('Failed to fetch user profile');
      }
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Fetch brand preferences
export const fetchBrandPreferences = createAsyncThunk(
  'user/fetchBrandPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      const preferences = await UserService.getBrandPreferences(userId);
      return preferences;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update brand preferences
export const updateBrandPreferences = createAsyncThunk(
  'user/updateBrandPreferences',
  async ({ userId, preferences }: { userId: string; preferences: BrandPreferences }, { rejectWithValue }) => {
    try {
      const success = await UserService.updateBrandPreferences(userId, preferences);
      if (!success) {
        return rejectWithValue('Failed to update brand preferences');
      }
      return preferences;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Upload brand logo
export const uploadBrandLogo = createAsyncThunk(
  'user/uploadBrandLogo',
  async ({ userId, file }: { userId: string; file: File }, { rejectWithValue }) => {
    try {
      const logoUrl = await UserService.uploadBrandLogo(userId, file);
      if (!logoUrl) {
        return rejectWithValue('Failed to upload brand logo');
      }
      return logoUrl;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Fetch notification preferences
export const fetchNotificationPreferences = createAsyncThunk(
  'user/fetchNotificationPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      const preferences = await UserService.getNotificationPreferences(userId);
      return preferences;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update notification preferences
export const updateNotificationPreferences = createAsyncThunk(
  'user/updateNotificationPreferences',
  async ({ userId, notifications }: { userId: string; notifications: NotificationPreferences }, { rejectWithValue }) => {
    try {
      const success = await UserService.updateNotificationPreferences(userId, notifications);
      if (!success) {
        return rejectWithValue('Failed to update notification preferences');
      }
      return notifications;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Fetch account info
export const fetchAccountInfo = createAsyncThunk(
  'user/fetchAccountInfo',
  async (userId: string, { rejectWithValue }) => {
    try {
      const accountInfo = await UserService.getAccountInfo(userId);
      if (!accountInfo) {
        return rejectWithValue('Failed to fetch account info');
      }
      return accountInfo;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Delete account
export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const success = await UserService.deleteAccount(userId);
      if (!success) {
        return rejectWithValue('Failed to delete account');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Sign out all devices
export const signOutAllDevices = createAsyncThunk(
  'user/signOutAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      const success = await UserService.signOutAllDevices();
      if (!success) {
        return rejectWithValue('Failed to sign out from all devices');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Upgrade plan
export const upgradePlan = createAsyncThunk(
  'user/upgradePlan',
  async ({ userId, planName }: { userId: string; planName: 'BASE' | 'PRO' }, { rejectWithValue }) => {
    try {
      const success = await UserService.upgradePlan(userId, planName);
      if (!success) {
        return rejectWithValue('Failed to upgrade plan');
      }
      return planName;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update general preferences
export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async ({ userId, preferences }: { userId: string; preferences: Partial<UserPreferences> }, { rejectWithValue }) => {
    try {
      const success = await UserService.updatePreferences(userId, preferences);
      if (!success) {
        return rejectWithValue('Failed to update preferences');
      }
      return preferences;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update integrations
export const updateIntegrations = createAsyncThunk(
  'user/updateIntegrations',
  async ({ userId, integrations }: { userId: string; integrations: Partial<UserIntegrations> }, { rejectWithValue }) => {
    try {
      const success = await UserService.updateIntegrations(userId, integrations);
      if (!success) {
        return rejectWithValue('Failed to update integrations');
      }
      return integrations;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set brand preferences locally (for immediate UI updates)
    setBrandPreferences: (state, action: PayloadAction<BrandPreferences>) => {
      state.brandPreferences = { ...state.brandPreferences, ...action.payload };
    },
    
    // Set notification preferences locally (for immediate UI updates)
    setNotificationPreferences: (state, action: PayloadAction<NotificationPreferences>) => {
      state.notificationPreferences = { ...state.notificationPreferences, ...action.payload };
    },
    
    // Set account info locally
    setAccountInfo: (state, action: PayloadAction<{ email: string; email_verified: boolean; plan: string }>) => {
      state.accountInfo = action.payload;
    },
    
    // Reset user state
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        // Cast the payload to our UserProfile type
        const profile = action.payload as any;
        state.profile = {
          ...profile,
          goals: Array.isArray(profile.goals) ? profile.goals : [],
          preferences: profile.preferences || {},
          integrations: profile.integrations || {},
          usage: profile.usage || {},
        };
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload as string;
      })
      
      // Fetch brand preferences
      .addCase(fetchBrandPreferences.pending, (state) => {
        state.loading.brandPreferences = true;
        state.error = null;
      })
      .addCase(fetchBrandPreferences.fulfilled, (state, action) => {
        state.loading.brandPreferences = false;
        state.brandPreferences = action.payload;
      })
      .addCase(fetchBrandPreferences.rejected, (state, action) => {
        state.loading.brandPreferences = false;
        state.error = action.payload as string;
      })
      
      // Update brand preferences
      .addCase(updateBrandPreferences.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updateBrandPreferences.fulfilled, (state, action) => {
        state.loading.saving = false;
        state.brandPreferences = { ...state.brandPreferences, ...action.payload };
      })
      .addCase(updateBrandPreferences.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Upload brand logo
      .addCase(uploadBrandLogo.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(uploadBrandLogo.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (state.brandPreferences) {
          state.brandPreferences.brand_logo_url = action.payload;
        }
      })
      .addCase(uploadBrandLogo.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Fetch notification preferences
      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.loading.notificationPreferences = true;
        state.error = null;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.loading.notificationPreferences = false;
        state.notificationPreferences = action.payload;
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.loading.notificationPreferences = false;
        state.error = action.payload as string;
      })
      
      // Update notification preferences
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.loading.saving = false;
        state.notificationPreferences = { ...state.notificationPreferences, ...action.payload };
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Fetch account info
      .addCase(fetchAccountInfo.pending, (state) => {
        state.loading.accountInfo = true;
        state.error = null;
      })
      .addCase(fetchAccountInfo.fulfilled, (state, action) => {
        state.loading.accountInfo = false;
        state.accountInfo = action.payload;
      })
      .addCase(fetchAccountInfo.rejected, (state, action) => {
        state.loading.accountInfo = false;
        state.error = action.payload as string;
      })
      
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading.saving = false;
        // Reset state after account deletion
        state.profile = null;
        state.brandPreferences = null;
        state.notificationPreferences = null;
        state.accountInfo = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Sign out all devices
      .addCase(signOutAllDevices.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(signOutAllDevices.fulfilled, (state) => {
        state.loading.saving = false;
        // Reset state after sign out
        state.profile = null;
        state.brandPreferences = null;
        state.notificationPreferences = null;
        state.accountInfo = null;
      })
      .addCase(signOutAllDevices.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Upgrade plan
      .addCase(upgradePlan.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(upgradePlan.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (state.accountInfo) {
          state.accountInfo.plan = action.payload;
        }
        if (state.profile) {
          state.profile.plan = action.payload;
        }
      })
      .addCase(upgradePlan.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (state.profile) {
          state.profile.preferences = { ...state.profile.preferences, ...action.payload };
        }
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Update integrations
      .addCase(updateIntegrations.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updateIntegrations.fulfilled, (state, action) => {
        state.loading.saving = false;
        if (state.profile) {
          state.profile.integrations = { ...state.profile.integrations, ...action.payload };
        }
      })
      .addCase(updateIntegrations.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setBrandPreferences,
  setNotificationPreferences,
  setAccountInfo,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
