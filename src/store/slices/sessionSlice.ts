import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { SessionState, User } from '../../types';
import { SessionInfo, SessionService } from '../../services/sessionService';
import { SESSION_TIMEOUT_MS, IDLE_WARNING_MS } from '../../constants/auth';

// =====================================================
// ENHANCED SESSION STATE
// =====================================================

export interface EnhancedSessionState extends SessionState {
  sessions: SessionInfo[];
  currentSession: SessionInfo | null;
  sessionCount: number;
  loading: {
    sessions: boolean;
    currentSession: boolean;
    saving: boolean;
  };
  error: string | null;
}

const initialState: EnhancedSessionState = {
  user: null,
  isAuthenticated: false,
  sessionExpiry: null,
  loginTime: null,
  showIdleModal: false,
  lastActivity: null,
  sessions: [],
  currentSession: null,
  sessionCount: 0,
  loading: {
    sessions: false,
    currentSession: false,
    saving: false,
  },
  error: null,
};

// =====================================================
// ASYNC THUNKS
// =====================================================

// Fetch user sessions
export const fetchUserSessions = createAsyncThunk(
  'session/fetchSessions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const sessions = await SessionService.fetchSessions(userId);
      return sessions;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Get current session
export const fetchCurrentSession = createAsyncThunk(
  'session/fetchCurrentSession',
  async (userId: string, { rejectWithValue }) => {
    try {
      const session = await SessionService.getCurrentSession(userId);
      return session;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Initialize session tracking
export const initializeSessionTracking = createAsyncThunk(
  'session/initializeTracking',
  async (userId: string, { rejectWithValue }) => {
    try {
      const sessionId = await SessionService.initializeSessionTracking(userId);
      if (!sessionId) {
        return rejectWithValue('Failed to initialize session tracking');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Revoke session
export const revokeSession = createAsyncThunk(
  'session/revokeSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const success = await SessionService.revokeSession(sessionId);
      if (!success) {
        return rejectWithValue('Failed to revoke session');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Revoke all sessions
export const revokeAllSessions = createAsyncThunk(
  'session/revokeAllSessions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const success = await SessionService.revokeAllSessions(userId);
      if (!success) {
        return rejectWithValue('Failed to revoke all sessions');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Delete session
export const deleteSession = createAsyncThunk(
  'session/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const success = await SessionService.deleteSession(sessionId);
      if (!success) {
        return rejectWithValue('Failed to delete session');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Update session activity
export const updateSessionActivity = createAsyncThunk(
  'session/updateActivity',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const success = await SessionService.updateSessionActivity(sessionId);
      if (!success) {
        return rejectWithValue('Failed to update session activity');
      }
      return sessionId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Get session count
export const fetchSessionCount = createAsyncThunk(
  'session/fetchSessionCount',
  async (userId: string, { rejectWithValue }) => {
    try {
      const count = await SessionService.getSessionCount(userId);
      return count;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Clean up old sessions
export const cleanupOldSessions = createAsyncThunk(
  'session/cleanupOldSessions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const success = await SessionService.cleanupOldSessions(userId);
      if (!success) {
        return rejectWithValue('Failed to cleanup old sessions');
      }
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      const now = Date.now();
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loginTime = now;
      state.sessionExpiry = now + SESSION_TIMEOUT_MS;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiry = null;
      state.loginTime = null;
      state.showIdleModal = false;
      state.lastActivity = null;
      state.sessions = [];
      state.currentSession = null;
      state.sessionCount = 0;
      state.error = null;
    },
    checkSessionTimeout: (state) => {
      const now = Date.now();
      if (state.sessionExpiry && now > state.sessionExpiry) {
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiry = null;
        state.loginTime = null;
        state.showIdleModal = false;
        state.lastActivity = null;
        state.sessions = [];
        state.currentSession = null;
        state.sessionCount = 0;
      } else if (state.sessionExpiry && !state.showIdleModal) {
        // Show warning 5 minutes before expiry
        const timeUntilExpiry = state.sessionExpiry - now;
        if (timeUntilExpiry <= (5 * 60 * 1000)) { // 5 minutes
          state.showIdleModal = true;
        }
      }
    },
    extendSession: (state) => {
      if (state.isAuthenticated) {
        const now = Date.now();
        state.sessionExpiry = now + SESSION_TIMEOUT_MS;
        state.lastActivity = now;
        state.showIdleModal = false;
      }
    },
    updateActivity: (state) => {
      if (state.isAuthenticated) {
        state.lastActivity = Date.now();
      }
    },
    showIdleModal: (state) => {
      state.showIdleModal = true;
    },
    hideIdleModal: (state) => {
      state.showIdleModal = false;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set sessions locally
    setSessions: (state, action: PayloadAction<SessionInfo[]>) => {
      state.sessions = action.payload;
    },
    // Set current session locally
    setCurrentSession: (state, action: PayloadAction<SessionInfo | null>) => {
      state.currentSession = action.payload;
    },
    // Set session count locally
    setSessionCount: (state, action: PayloadAction<number>) => {
      state.sessionCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user sessions
      .addCase(fetchUserSessions.pending, (state) => {
        state.loading.sessions = true;
        state.error = null;
      })
      .addCase(fetchUserSessions.fulfilled, (state, action) => {
        state.loading.sessions = false;
        state.sessions = action.payload;
      })
      .addCase(fetchUserSessions.rejected, (state, action) => {
        state.loading.sessions = false;
        state.error = action.payload as string;
      })
      
      // Fetch current session
      .addCase(fetchCurrentSession.pending, (state) => {
        state.loading.currentSession = true;
        state.error = null;
      })
      .addCase(fetchCurrentSession.fulfilled, (state, action) => {
        state.loading.currentSession = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchCurrentSession.rejected, (state, action) => {
        state.loading.currentSession = false;
        state.error = action.payload as string;
      })
      
      // Initialize session tracking
      .addCase(initializeSessionTracking.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(initializeSessionTracking.fulfilled, (state) => {
        state.loading.saving = false;
      })
      .addCase(initializeSessionTracking.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Revoke session
      .addCase(revokeSession.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(revokeSession.fulfilled, (state, action) => {
        state.loading.saving = false;
        // Remove revoked session from list
        state.sessions = state.sessions.filter(session => session.id !== action.payload);
        // Update session count
        state.sessionCount = Math.max(0, state.sessionCount - 1);
      })
      .addCase(revokeSession.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Revoke all sessions
      .addCase(revokeAllSessions.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(revokeAllSessions.fulfilled, (state) => {
        state.loading.saving = false;
        // Clear all sessions except current
        state.sessions = state.sessions.filter(session => session.is_current);
        state.sessionCount = 1; // Only current session remains
      })
      .addCase(revokeAllSessions.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Delete session
      .addCase(deleteSession.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading.saving = false;
        // Remove deleted session from list
        state.sessions = state.sessions.filter(session => session.id !== action.payload);
        // Update session count
        state.sessionCount = Math.max(0, state.sessionCount - 1);
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Update session activity
      .addCase(updateSessionActivity.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(updateSessionActivity.fulfilled, (state, action) => {
        state.loading.saving = false;
        // Update last_active for the session
        const sessionIndex = state.sessions.findIndex(session => session.id === action.payload);
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].last_active = new Date().toISOString();
        }
        if (state.currentSession && state.currentSession.id === action.payload) {
          state.currentSession.last_active = new Date().toISOString();
        }
      })
      .addCase(updateSessionActivity.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      })
      
      // Fetch session count
      .addCase(fetchSessionCount.pending, (state) => {
        state.loading.currentSession = true;
        state.error = null;
      })
      .addCase(fetchSessionCount.fulfilled, (state, action) => {
        state.loading.currentSession = false;
        state.sessionCount = action.payload;
      })
      .addCase(fetchSessionCount.rejected, (state, action) => {
        state.loading.currentSession = false;
        state.error = action.payload as string;
      })
      
      // Cleanup old sessions
      .addCase(cleanupOldSessions.pending, (state) => {
        state.loading.saving = true;
        state.error = null;
      })
      .addCase(cleanupOldSessions.fulfilled, (state) => {
        state.loading.saving = false;
        // Keep only the 10 most recent sessions
        if (state.sessions.length > 10) {
          state.sessions = state.sessions.slice(0, 10);
        }
      })
      .addCase(cleanupOldSessions.rejected, (state, action) => {
        state.loading.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  loginSuccess, 
  logout, 
  checkSessionTimeout, 
  extendSession, 
  updateActivity, 
  showIdleModal, 
  hideIdleModal,
  updateUserProfile,
  clearError,
  setSessions,
  setCurrentSession,
  setSessionCount,
} = sessionSlice.actions;
export default sessionSlice.reducer;