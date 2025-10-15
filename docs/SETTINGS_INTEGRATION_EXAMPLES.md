// =====================================================
// INTEGRATION EXAMPLES FOR SETTINGS COMPONENTS
// =====================================================

/*
This file shows how to integrate the new Supabase services and Redux state
with the existing Settings components without changing the UI layout.

Example integrations for each settings section:
*/

// =====================================================
// 1. BRAND PREFERENCES INTEGRATION
// =====================================================

/*
// In your Brand Preferences component:

import React, { useEffect } from 'react';
import { useBrandPreferences } from '../../hooks/useUserSettings';
import { message } from 'antd';

const BrandPreferencesSection = () => {
  const {
    brandPreferences,
    loading,
    updateBrandPreference,
    saveBrandPreferences,
  } = useBrandPreferences();

  const handleColorChange = (colorType: 'primary' | 'secondary', color: string) => {
    updateBrandPreference(`brand_${colorType}_color`, color);
  };

  const handleFontChange = (font: string) => {
    updateBrandPreference('brand_font', font);
  };

  const handleSave = async () => {
    await saveBrandPreferences();
    // Success message is handled by the service
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Preferences</CardTitle>
        <CardDescription>Customize your brand identity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Color</Label>
          <Input
            type="color"
            value={brandPreferences?.brand_primary_color || '#1ABC9C'}
            onChange={(e) => handleColorChange('primary', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Secondary Color</Label>
          <Input
            type="color"
            value={brandPreferences?.brand_secondary_color || '#0B1D3A'}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Brand Font</Label>
          <Select
            value={brandPreferences?.brand_font || 'Inter'}
            onValueChange={handleFontChange}
          >
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
          </Select>
        </div>
        
        <Button onClick={handleSave} loading={loading}>
          Save Brand Preferences
        </Button>
      </CardContent>
    </Card>
  );
};
*/

// =====================================================
// 2. NOTIFICATION PREFERENCES INTEGRATION
// =====================================================

/*
// In your Notification Preferences component:

import React from 'react';
import { useNotificationPreferences } from '../../hooks/useUserSettings';

const NotificationPreferencesSection = () => {
  const {
    notificationPreferences,
    loading,
    toggleNotification,
  } = useNotificationPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>In-App Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications within the app
            </p>
          </div>
          <Switch
            checked={notificationPreferences?.inApp ?? true}
            onCheckedChange={(checked) => toggleNotification('inApp', checked)}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via email
            </p>
          </div>
          <Switch
            checked={notificationPreferences?.email ?? true}
            onCheckedChange={(checked) => toggleNotification('email', checked)}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};
*/

// =====================================================
// 3. ACCOUNT MANAGEMENT INTEGRATION
// =====================================================

/*
// In your Account Management component:

import React from 'react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

const AccountManagementSection = () => {
  const {
    accountInfo,
    loading,
    handleDeleteAccount,
    handleSignOutAllDevices,
    handleUpgradePlan,
  } = useUserSettings();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={accountInfo?.email || ''} disabled />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={accountInfo?.email_verified ? 'default' : 'destructive'}>
                {accountInfo?.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Current Plan</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{accountInfo?.plan || 'BASE'}</Badge>
              {accountInfo?.plan === 'BASE' && (
                <Button
                  onClick={() => handleUpgradePlan('PRO')}
                  loading={loading.saving}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleSignOutAllDevices}
              loading={loading.saving}
            >
              Sign Out from All Devices
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              loading={loading.saving}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
*/

// =====================================================
// 4. SESSION MANAGEMENT INTEGRATION
// =====================================================

/*
// In your Session Management component:

import React from 'react';
import { useSessionManagement } from '../../hooks/useUserSettings';
import { formatDistanceToNow } from 'date-fns';

const SessionManagementSection = () => {
  const {
    sessions,
    currentSession,
    sessionCount,
    loading,
    revokeSession,
    revokeAllSessions,
    deleteSession,
  } = useSessionManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your logged-in devices ({sessionCount} active)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {session.device_name || 'Unknown Device'}
                </span>
                {session.is_current && (
                  <Badge variant="default">Current</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {session.location || 'Unknown Location'}
              </p>
              <p className="text-xs text-muted-foreground">
                Last active: {formatDistanceToNow(new Date(session.last_active))} ago
              </p>
            </div>
            
            {!session.is_current && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  loading={loading}
                >
                  Revoke
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSession(session.id)}
                  loading={loading}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {sessions.length > 1 && (
          <Button
            variant="outline"
            onClick={revokeAllSessions}
            loading={loading}
            className="w-full"
          >
            Sign Out from All Other Devices
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
*/

// =====================================================
// 5. COMPLETE SETTINGS PAGE INTEGRATION
// =====================================================

/*
// In your main Settings page:

import React, { useEffect } from 'react';
import { useUserSettings } from '../../hooks/useUserSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import BrandPreferencesSection from './BrandPreferencesSection';
import NotificationPreferencesSection from './NotificationPreferencesSection';
import AccountManagementSection from './AccountManagementSection';
import SessionManagementSection from './SessionManagementSection';

const SettingsPage = () => {
  const {
    user,
    profile,
    loading,
    error,
    clearUserError,
  } = useUserSettings();

  useEffect(() => {
    if (error) {
      // Error messages are handled by the services
      // You can also show additional UI feedback here
      console.error('Settings error:', error);
    }
  }, [error]);

  if (!user) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="brand">Brand</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="space-y-4">
          <BrandPreferencesSection />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationPreferencesSection />
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <AccountManagementSection />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
*/

// =====================================================
// 6. USAGE IN EXISTING SETTINGS COMPONENTS
// =====================================================

/*
To integrate with your existing Settings.tsx file, you can:

1. Import the hook:
   import { useUserSettings } from '../hooks/useUserSettings';

2. Use the hook in your component:
   const {
     brandPreferences,
     notificationPreferences,
     accountInfo,
     sessions,
     loading,
     handleBrandPreferenceChange,
     saveBrandPreferences,
     handleNotificationToggle,
     handleDeleteAccount,
     handleSignOutAllDevices,
     handleUpgradePlan,
     handleRevokeSession,
     handleRevokeAllSessions,
   } = useUserSettings();

3. Replace your existing handlers with the new ones:
   - Replace handlePreferenceUpdate with handleBrandPreferenceChange
   - Replace notification toggles with handleNotificationToggle
   - Replace account actions with the new handlers

4. Update your JSX to use the new state:
   - Use brandPreferences instead of local state
   - Use notificationPreferences instead of local state
   - Use accountInfo for account information
   - Use sessions for session management

The UI layout remains exactly the same - only the data source and handlers change.
*/
