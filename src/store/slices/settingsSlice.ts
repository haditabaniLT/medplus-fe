import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  preferences: {
    language: string;
    timezone: string;
    defaultCategory: string;
    defaultTone: 'friendly' | 'professional' | 'concise';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
  integrations: {
    canva: {
      connected: boolean;
      lastSynced: string | null;
    };
    gamma: {
      connected: boolean;
      lastSynced: string | null;
    };
  };
}

const initialState: SettingsState = {
  preferences: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    defaultCategory: 'Decision Mastery',
    defaultTone: 'professional',
    notifications: {
      email: true,
      push: false,
      marketing: false,
    },
  },
  integrations: {
    canva: {
      connected: false,
      lastSynced: null,
    },
    gamma: {
      connected: false,
      lastSynced: null,
    },
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<SettingsState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    toggleIntegration: (state, action: PayloadAction<'canva' | 'gamma'>) => {
      const integration = state.integrations[action.payload];
      integration.connected = !integration.connected;
      integration.lastSynced = integration.connected ? new Date().toISOString() : null;
    },
    updateIntegrationSync: (state, action: PayloadAction<'canva' | 'gamma'>) => {
      state.integrations[action.payload].lastSynced = new Date().toISOString();
    },
  },
});

export const { updatePreferences, toggleIntegration, updateIntegrationSync } = settingsSlice.actions;
export default settingsSlice.reducer;
