import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import sessionSlice from './slices/sessionSlice';
import themeSlice from './slices/themeSlice';
import onboardingSlice from './slices/onboardingSlice';
import taskSlice from './slices/taskSlice';
import uiSlice from './slices/uiSlice';
import templatesSlice from './slices/templatesSlice';
import notificationsSlice from './slices/notificationsSlice';
import settingsSlice from './slices/settingsSlice';
import userSlice from './slices/userSlice';
import { taskApi } from './api/taskApi';
import { templateApi } from './api/templateApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['session', 'theme', 'templates', 'notifications', 'settings', 'user'], // Only persist these reducers
};

const rootReducer = combineReducers({
  session: sessionSlice,
  theme: themeSlice,
  onboarding: onboardingSlice,
  task: taskSlice,
  ui: uiSlice,
  templates: templatesSlice,
  notifications: notificationsSlice,
  settings: settingsSlice,
  user: userSlice,
  [taskApi.reducerPath]: taskApi.reducer,
  [templateApi.reducerPath]: templateApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['task.selectedTasks'], // Ignore Set in serialization check
      },
    }).concat(taskApi.middleware as any, templateApi.middleware as any),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;