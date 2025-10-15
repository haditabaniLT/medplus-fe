import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  fetchUserProfile,
  fetchBrandPreferences,
  fetchNotificationPreferences,
  fetchAccountInfo,
  updateBrandPreferences,
  updateNotificationPreferences,
  deleteAccount,
  signOutAllDevices,
  upgradePlan,
  setBrandPreferences,
  setNotificationPreferences,
  clearError,
} from '../store/slices/userSlice';
import {
  fetchUserSessions,
  revokeSession,
  revokeAllSessions,
  deleteSession,
} from '../store/slices/sessionSlice';

// =====================================================
// USER SETTINGS HOOK
// =====================================================

export const useUserSettings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const userState = useSelector((state: RootState) => state.user);
  const sessionState = useSelector((state: RootState) => state.session);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  useEffect(() => {
    if (user?.id) {
      // Fetch all user data on mount
      dispatch(fetchUserProfile(user.id));
      dispatch(fetchBrandPreferences(user.id));
      dispatch(fetchNotificationPreferences(user.id));
      dispatch(fetchAccountInfo(user.id));
      dispatch(fetchUserSessions(user.id));
    }
  }, [dispatch, user?.id]);

  // =====================================================
  // BRAND PREFERENCES
  // =====================================================

  const handleBrandPreferenceChange = (key: string, value: string) => {
    if (!user?.id) return;
    
    // Update Redux state immediately for UI responsiveness
    dispatch(setBrandPreferences({ [key]: value }));
  };

  const saveBrandPreferences = async () => {
    if (!user?.id || !userState.brandPreferences) return;
    
    await dispatch(updateBrandPreferences({
      userId: user.id,
      preferences: userState.brandPreferences
    }));
  };

  // =====================================================
  // NOTIFICATION PREFERENCES
  // =====================================================

  const handleNotificationToggle = (key: 'inApp' | 'email', value: boolean) => {
    if (!user?.id) return;
    
    // Update Redux state immediately for UI responsiveness
    dispatch(setNotificationPreferences({ [key]: value }));
    
    // Save to Supabase
    dispatch(updateNotificationPreferences({
      userId: user.id,
      notifications: { [key]: value }
    }));
  };

  // =====================================================
  // ACCOUNT MANAGEMENT
  // =====================================================

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    await dispatch(deleteAccount(user.id));
  };

  const handleSignOutAllDevices = async () => {
    await dispatch(signOutAllDevices());
  };

  const handleUpgradePlan = async (planName: 'BASE' | 'PRO') => {
    if (!user?.id) return;
    
    await dispatch(upgradePlan({ userId: user.id, planName }));
  };

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  const handleRevokeSession = async (sessionId: string) => {
    await dispatch(revokeSession(sessionId));
  };

  const handleRevokeAllSessions = async () => {
    if (!user?.id) return;
    
    await dispatch(revokeAllSessions(user.id));
  };

  const handleDeleteSession = async (sessionId: string) => {
    await dispatch(deleteSession(sessionId));
  };

  // =====================================================
  // ERROR HANDLING
  // =====================================================

  const clearUserError = () => {
    dispatch(clearError());
  };

  // =====================================================
  // RETURN VALUES
  // =====================================================

  return {
    // User data
    user,
    profile: userState.profile,
    brandPreferences: userState.brandPreferences,
    notificationPreferences: userState.notificationPreferences,
    accountInfo: userState.accountInfo,
    
    // Session data
    sessions: sessionState.sessions,
    currentSession: sessionState.currentSession,
    sessionCount: sessionState.sessionCount,
    
    // Loading states
    loading: {
      profile: userState.loading.profile,
      brandPreferences: userState.loading.brandPreferences,
      notificationPreferences: userState.loading.notificationPreferences,
      accountInfo: userState.loading.accountInfo,
      saving: userState.loading.saving,
      sessions: sessionState.loading.sessions,
    },
    
    // Error states
    error: userState.error || sessionState.error,
    
    // Actions
    handleBrandPreferenceChange,
    saveBrandPreferences,
    handleNotificationToggle,
    handleDeleteAccount,
    handleSignOutAllDevices,
    handleUpgradePlan,
    handleRevokeSession,
    handleRevokeAllSessions,
    handleDeleteSession,
    clearUserError,
  };
};

// =====================================================
// BRAND PREFERENCES HOOK
// =====================================================

export const useBrandPreferences = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const { brandPreferences, loading } = useSelector((state: RootState) => state.user);

  const updateBrandPreference = (key: string, value: string) => {
    if (!user?.id) return;
    
    dispatch(setBrandPreferences({ [key]: value }));
  };

  const saveBrandPreferences = async () => {
    if (!user?.id || !brandPreferences) return;
    
    await dispatch(updateBrandPreferences({
      userId: user.id,
      preferences: brandPreferences
    }));
  };

  return {
    brandPreferences,
    loading: loading.saving,
    updateBrandPreference,
    saveBrandPreferences,
  };
};

// =====================================================
// NOTIFICATION PREFERENCES HOOK
// =====================================================

export const useNotificationPreferences = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const { notificationPreferences, loading } = useSelector((state: RootState) => state.user);

  const toggleNotification = async (key: 'inApp' | 'email', value: boolean) => {
    if (!user?.id) return;
    
    // Update Redux state immediately
    dispatch(setNotificationPreferences({ [key]: value }));
    
    // Save to Supabase
    await dispatch(updateNotificationPreferences({
      userId: user.id,
      notifications: { [key]: value }
    }));
  };

  return {
    notificationPreferences,
    loading: loading.saving,
    toggleNotification,
  };
};

// =====================================================
// SESSION MANAGEMENT HOOK
// =====================================================

export const useSessionManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const { sessions, currentSession, sessionCount, loading } = useSelector((state: RootState) => state.session);

  const revokeSession = async (sessionId: string) => {
    await dispatch(revokeSession(sessionId));
  };

  const revokeAllSessions = async () => {
    if (!user?.id) return;
    
    await dispatch(revokeAllSessions(user.id));
  };

  const deleteSession = async (sessionId: string) => {
    await dispatch(deleteSession(sessionId));
  };

  return {
    sessions,
    currentSession,
    sessionCount,
    loading: loading.saving,
    revokeSession,
    revokeAllSessions,
    deleteSession,
  };
};
