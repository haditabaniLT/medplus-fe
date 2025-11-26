import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, theme } from 'antd';
import { useSelector } from 'react-redux';
import { store, persistor } from './store';
import { RootState } from './store';
import { loginSuccess, logout } from './store/slices/sessionSlice';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Templates from "./pages/Templates";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SuperPromptsList from "./pages/SuperPromptsList";
import SuperPromptsCreate from "./pages/SuperPrompts";
import SuperPromptDetail from "./pages/SuperPromptDetail";
import SignupForm from "./components/auth/SignupForm";
import VerifyEmailForm from "./components/auth/VerifyEmailForm";
import LoginForm from "./components/auth/LoginForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import IdleTimeoutModal from "./components/auth/IdleTimeoutModal";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import NotFound from "./pages/NotFound";
import supabase from './supabase/supabaseClient';

const queryClient = new QueryClient();

const AppContent = () => {
  const dispatch = useDispatch();
  const { isDark } = useSelector((state: RootState) => state.theme);


  useEffect(() => {
    const subs = supabase.auth.onAuthStateChange((event, session) => {
      console.log("======[event]=====", event)
      console.log("======[session]=====", session)
    })
    return () => {
      subs.data.subscription.unsubscribe()
    }
  }, []);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 12,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/super-prompts" element={<SuperPromptsList />} />
              <Route path="/super-prompts/create" element={<SuperPromptsCreate />} />
              <Route path="/super-prompts/:id" element={<SuperPromptDetail />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/verify-email" element={<VerifyEmailForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <IdleTimeoutModal />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <AppContent />
    </PersistGate>
  </Provider>
);

export default App;
