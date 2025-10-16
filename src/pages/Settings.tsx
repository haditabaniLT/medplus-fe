import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { getUserProfile, updateUserProfile, updateUserPassword } from "@/supabase/auth";
import { toggleTheme } from '../store/slices/themeSlice';
import { updatePreferences, toggleIntegration, updateIntegrationSync } from '../store/slices/settingsSlice';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Zap, 
  Check, 
  ExternalLink, 
  Shield, 
  Download, 
  Trash2, 
  AlertTriangle,
  Monitor,
  LogOut,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const Settings = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.session);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { preferences, integrations } = useSelector((state: RootState) => state.settings);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Database calls removed - Supabase implementation removed
      // Replace with your database client calls
      
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Fetch user profile data from Supabase
      const profileData = await getUserProfile(user.id);

      if (profileData) {
        // Load preferences from database
        const dbPreferences = profileData.preferences || {
          language: 'en',
          timezone: 'UTC',
          defaultCategory: 'general',
          defaultTone: 'professional',
          notifications: {
            email: true,
            push: false,
            marketing: false,
          },
        };

        // Load integrations from database
        const dbIntegrations = profileData.integrations || {
          canva: { connected: false, lastSynced: null },
          gamma: { connected: false, lastSynced: null },
        };

        dispatch(updatePreferences(dbPreferences));

        // Sync integrations from Supabase to Redux
        const integrationsData = dbIntegrations as Record<string, any>;
        const canvaData = integrationsData.canva || { connected: false, lastSynced: null };
        const gammaData = integrationsData.gamma || { connected: false, lastSynced: null };
        
        if (canvaData.connected !== integrations.canva.connected) {
          dispatch(toggleIntegration('canva'));
        }
        if (gammaData.connected !== integrations.gamma.connected) {
          dispatch(toggleIntegration('gamma'));
        }
      } else {
        // Fallback to default settings if profile fetch fails
        const data = {
          preferences: {
            language: 'en',
            timezone: 'UTC',
            defaultCategory: 'general',
            defaultTone: 'professional',
            notifications: {
              email: true,
              push: false,
              marketing: false,
            },
          },
          integrations: {
            canva: { connected: false, lastSynced: null },
            gamma: { connected: false, lastSynced: null },
          },
        };

        if (data.preferences) {
          dispatch(updatePreferences(data.preferences));
        }
        if (data.integrations) {
          // Sync integrations from Supabase to Redux
          const integrationsData = data.integrations as Record<string, any>;
          const canvaData = integrationsData.canva || { connected: false, lastSynced: null };
          const gammaData = integrationsData.gamma || { connected: false, lastSynced: null };
          
          if (canvaData.connected !== integrations.canva.connected) {
            dispatch(toggleIntegration('canva'));
          }
          if (gammaData.connected !== integrations.gamma.connected) {
            dispatch(toggleIntegration('gamma'));
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';
  const tasksUsed = 7; // Mock data
  const maxTasks = userPlan === 'base' ? 10 : 100;
  const usagePercentage = (tasksUsed / maxTasks) * 100;

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score += 20;
    });

    return {
      score,
      checks,
      strength: score < 40 ? 'weak' : score < 80 ? 'medium' : 'strong',
      color: score < 40 ? 'bg-red-500' : score < 80 ? 'bg-yellow-500' : 'bg-green-500'
    };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    toast({
      title: 'Theme updated',
      description: `Switched to ${!isDark ? 'dark' : 'light'} mode`,
    });
  };

  const handlePreferenceUpdate = async (key: string, value: any) => {
    if (!user?.id) return;

    setSaving(true);
    dispatch(updatePreferences({ [key]: value }));

    try {
      const updatedPreferences = { ...preferences, [key]: value };
      
      // Save to Supabase
      await updateUserProfile(user.id, {
        preferences: updatedPreferences
      });

      toast({
        title: 'Preference saved',
        description: 'Your settings have been updated',
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preference',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleIntegrationToggle = async (integration: 'canva' | 'gamma') => {
    // Database calls removed - Supabase implementation removed
    // Replace with your database client calls
    const authUser = { id: 'mock-user-id' }; // Mock user data
    if (!authUser?.id) return;

    if (userPlan === 'base') {
      toast({
        title: 'Upgrade Required',
        description: 'Integrations are available for Pro users only',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const isConnecting = !integrations[integration].connected;
    dispatch(toggleIntegration(integration));

    try {
      // Update integrations in Supabase
      const updatedIntegrations = {
        ...integrations,
        [integration]: {
          connected: isConnecting,
          lastSynced: isConnecting ? new Date().toISOString() : null,
        },
      };

      // Update user profile with new integrations
      await updateUserProfile(user.id, {
        integrations: updatedIntegrations
      });

      toast({
        title: isConnecting ? 'Connected' : 'Disconnected',
        description: `${integration.charAt(0).toUpperCase() + integration.slice(1)} ${isConnecting ? 'connected' : 'disconnected'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      // Revert on error
      dispatch(toggleIntegration(integration));
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast({
        title: 'Weak Password',
        description: 'Password must contain uppercase, lowercase, numbers, and special characters',
        variant: 'destructive',
      });
      return;
    }

    if (oldPassword === newPassword) {
      toast({
        title: 'Error',
        description: 'New password must be different from current password',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Update password in Supabase
      await updateUserPassword(newPassword);

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully',
      });
      
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Current password is incorrect';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password does not meet requirements';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    // Database calls removed - Supabase implementation removed
    // Replace with your database client calls
    const authUser = { id: 'mock-user-id' }; // Mock user data
    if (!authUser?.id) return;

    setSaving(true);
    try {
      // Database fetch removed - Supabase implementation removed
      // Replace with your database client fetch call
      const profile = { id: authUser.id, preferences, integrations }; // Mock profile data
      const profileError = null; // Mock no error

      if (profileError) throw profileError;

      const exportData = {
        profile,
        preferences,
        integrations,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meplus-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported',
        description: 'Your data has been downloaded',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Database calls removed - Supabase implementation removed
    // Replace with your database client calls
    const authUser = { id: 'mock-user-id', email: 'user@example.com' }; // Mock user data
    if (!authUser?.email || deleteConfirmEmail !== authUser.email) {
      toast({
        title: 'Error',
        description: 'Email does not match',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Database delete removed - Supabase implementation removed
      // Replace with your database client delete call
      const deleteError = null; // Mock no error

      if (deleteError) throw deleteError;

      // Sign out removed - Supabase implementation removed
      // Replace with your authentication system's logout
      console.log('Account deletion completed - authentication system not implemented');

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      });
      
      setShowDeleteDialog(false);
      
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const mockSessions = [
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: new Date().toISOString(), current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Los Angeles, US', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false },
  ];

  const handleSignOutSession = async (sessionId: number) => {
    if (sessionId === 1) {
      // Current session - sign out removed - Supabase implementation removed
      // Replace with your authentication system's logout
      console.log('Session sign out - authentication system not implemented');
      window.location.href = '/';
    } else {
      toast({
        title: 'Session signed out',
        description: 'The session has been terminated',
      });
    }
  };

  const handleSignOutAllSessions = async () => {
    try {
      // Sign out all sessions removed - Supabase implementation removed
      // Replace with your authentication system's logout all sessions
      console.log('Sign out all sessions - authentication system not implemented');
      toast({
        title: 'All sessions signed out',
        description: 'You have been signed out from all devices',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out all sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out all sessions',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Loading your settings...</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-10 bg-muted animate-pulse rounded" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="plan">Plan & Billing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how MePlus.ai looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      {isDark ? 'Dark' : 'Light'} mode
                    </p>
                  </div>
                  <Switch checked={isDark} onCheckedChange={handleThemeToggle} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Configure language and timezone preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={preferences.language} 
                    onValueChange={(value) => handlePreferenceUpdate('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={preferences.timezone}
                    onValueChange={(value) => handlePreferenceUpdate('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defaults</CardTitle>
                <CardDescription>Set your default preferences for new tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <Select 
                    value={preferences.defaultCategory}
                    onValueChange={(value) => handlePreferenceUpdate('defaultCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select 
                    value={preferences.defaultTone}
                    onValueChange={(value) => handlePreferenceUpdate('defaultTone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', { ...preferences.notifications, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', { ...preferences.notifications, push: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional content
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.marketing}
                    onCheckedChange={(checked) => handlePreferenceUpdate('notifications', { ...preferences.notifications, marketing: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan & Billing Tab */}
          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{userPlan.toUpperCase()}</h3>
                      {userPlan === 'pro' && <Crown className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userPlan === 'base' ? 'Limited features' : 'Full access to all features'}
                    </p>
                  </div>
                  {userPlan === 'base' && (
                    <Button className="bg-gradient-primary">
                      <Zap className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usage this month</span>
                    <span className="font-medium">{tasksUsed} / {maxTasks} tasks</span>
                  </div>
                  <Progress value={usagePercentage} />
                  <p className="text-xs text-muted-foreground">
                    Resets on the 1st of each month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Comparison</CardTitle>
                <CardDescription>See what's included in each plan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-center">Base</TableHead>
                      <TableHead className="text-center">Pro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Tasks per month</TableCell>
                      <TableCell className="text-center">10</TableCell>
                      <TableCell className="text-center">100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Max task length</TableCell>
                      <TableCell className="text-center">4,000 chars</TableCell>
                      <TableCell className="text-center">10,000 chars</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Export formats</TableCell>
                      <TableCell className="text-center">PDF</TableCell>
                      <TableCell className="text-center">PDF, Canva, Gamma</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Brand customization</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-success" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Voice input</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center"><Check className="h-4 w-4 mx-auto text-success" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Management</CardTitle>
                <CardDescription>Manage your billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://estage.com" target="_blank" rel="noopener noreferrer">
                    Manage Plan
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Canva Integration</CardTitle>
                <CardDescription>Export your tasks directly to Canva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={integrations.canva.connected ? 'default' : 'secondary'}>
                        {integrations.canva.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                    {integrations.canva.lastSynced && (
                      <p className="text-xs text-muted-foreground">
                        Last synced {formatDistanceToNow(new Date(integrations.canva.lastSynced), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Switch 
                    checked={integrations.canva.connected}
                    onCheckedChange={() => handleIntegrationToggle('canva')}
                    disabled={saving || userPlan === 'base'}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gamma Integration</CardTitle>
                <CardDescription>Create presentations from your tasks in Gamma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={integrations.gamma.connected ? 'default' : 'secondary'}>
                        {integrations.gamma.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                    {integrations.gamma.lastSynced && (
                      <p className="text-xs text-muted-foreground">
                        Last synced {formatDistanceToNow(new Date(integrations.gamma.lastSynced), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Switch 
                    checked={integrations.gamma.connected}
                    onCheckedChange={() => handleIntegrationToggle('gamma')}
                    disabled={saving || userPlan === 'base'}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password for better security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium capitalize">
                          {passwordStrength.strength}
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <Check className="h-3 w-3" />
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <Check className="h-3 w-3" />
                          Uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <Check className="h-3 w-3" />
                          Lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.checks.numbers ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <Check className="h-3 w-3" />
                          Number
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.checks.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <Check className="h-3 w-3" />
                          Special character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-1 text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                      {newPassword === confirmPassword ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength.score < 80}
                  className="w-full"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {saving ? 'Updating Password...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your logged-in devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && <Badge variant="secondary" className="text-xs">Current</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{session.location}</p>
                          <p className="text-xs text-muted-foreground">
                            Active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSignOutSession(session.id)}
                          disabled={saving}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleSignOutAllSessions}
                    disabled={saving}
                  >
                    {saving ? 'Signing out...' : 'Sign out all other sessions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Your Data</CardTitle>
                <CardDescription>Download a copy of all your data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportData} variant="outline" className="w-full" disabled={saving}>
                  <Download className="mr-2 h-4 w-4" />
                  {saving ? 'Exporting...' : 'Export Data (JSON)'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will permanently delete your account and remove all your data from our servers.
                  This action cannot be undone.
                </p>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="confirmEmail">Type your email to confirm:</Label>
                  <Input
                    id="confirmEmail"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={user?.email}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleteConfirmEmail !== user?.email}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
