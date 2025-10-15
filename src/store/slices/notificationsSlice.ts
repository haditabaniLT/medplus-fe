import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [
    {
      id: '1',
      title: 'Welcome to MePlus.ai',
      message: 'Get started with AI-powered task generation and boost your productivity!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false,
    },
    {
      id: '2',
      title: 'Your usage resets on Oct 31',
      message: 'Your monthly task quota will reset at the end of this month.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      read: false,
    },
    {
      id: '3',
      title: 'New Pro category unlocked',
      message: 'Check out the new Business Strategy templates available for Pro users.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: false,
    },
    {
      id: '4',
      title: 'Export to Canva is now connected',
      message: 'You can now export your tasks directly to Canva for design work.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      read: true,
    },
    {
      id: '5',
      title: 'Reminder: Verify your email',
      message: 'Please verify your email address to unlock all features.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      read: true,
    },
    {
      id: '6',
      title: 'Upgrade to Pro for unlimited tasks',
      message: 'Get unlimited task generation and access to premium templates.',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      read: true,
    },
    {
      id: '7',
      title: 'System maintenance scheduled tomorrow',
      message: 'We will perform system maintenance on Oct 28 from 2-4 AM EST.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      read: true,
    },
  ],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.notifications.unshift(newNotification);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
  },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
