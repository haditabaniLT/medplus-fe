import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TaskCategory } from '../../types/task.types';
import { DEFAULT_CATEGORY } from '../../constants/categories';

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  showExportModal: boolean;
  showUpgradeModal: boolean;
  notifications: Notification[];
  activeCategory: TaskCategory;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  showExportModal: false,
  showUpgradeModal: false,
  notifications: [],
  activeCategory: DEFAULT_CATEGORY,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    showExportModal: (state) => {
      state.showExportModal = true;
    },
    hideExportModal: (state) => {
      state.showExportModal = false;
    },
    showUpgradeModal: (state) => {
      state.showUpgradeModal = true;
    },
    hideUpgradeModal: (state) => {
      state.showUpgradeModal = false;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    setActiveCategory: (state, action: PayloadAction<TaskCategory>) => {
      state.activeCategory = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  showExportModal,
  hideExportModal,
  showUpgradeModal,
  hideUpgradeModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setActiveCategory,
} = uiSlice.actions;

export default uiSlice.reducer;
