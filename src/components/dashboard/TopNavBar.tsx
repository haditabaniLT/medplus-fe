import React, { useState } from 'react';
import { Bell, Sun, Moon, User, Settings, LogOut, Menu, Zap, Crown, ArrowRight } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';
import { markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';
import { logout } from '../../store/slices/sessionSlice';
import { logoutUser } from '../../supabase/auth';
import { useGetUsageQuery } from '../../store/api/taskApi';
import { Button } from '../ui/Button';
import { NavLink, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface TopNavBarProps {
  onMenuToggle: () => void;
  onUpgrade?: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onMenuToggle, onUpgrade }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.session);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const { notifications } = useSelector((state: RootState) => state.notifications);
  
  // Fetch usage data using the API
  const { data: usageData } = useGetUsageQuery();

  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';
  const tasksUsed = usageData?.usage.tasks_generated || 0;
  const maxTasks = usageData?.limits.tasks_generated || (userPlan === 'base' ? 10 : 100);
  const usagePercentage = (tasksUsed / maxTasks) * 100;

  const unreadNotifications = notifications.filter(n => !n.read);
  const recentNotifications = notifications.slice(0, 7);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await logoutUser();
      
      // Clear Redux state
      dispatch(logout());
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      dispatch(logout());
      navigate('/login');
    }
  };

  const handleNotificationClick = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (user: any) => {
    if (user?.fullName) {
      return user.fullName.split(' ')[0];
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="tablet:hidden desktop:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg text-foreground">
              Welcome {getDisplayName(user)}
            </span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Usage Indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted cursor-pointer">
                  <div className="flex flex-col gap-1 min-w-[80px]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{tasksUsed}/{maxTasks}</span>
                      {userPlan === 'base' && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">Base</Badge>
                      )}
                    </div>
                    <Progress value={usagePercentage} className="h-1" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{maxTasks - tasksUsed} tasks remaining this month</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Pro Badge or Upgrade Button */}
          {userPlan === 'pro' ? (
            <Badge variant="default" className="bg-gradient-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          ) : (
            <>
              {/* Mobile: Icon only */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="lg:hidden bg-gradient-primary hover:opacity-90"
                      onClick={onUpgrade}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Upgrade to Pro</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Desktop: Full button */}
              <Button
                size="sm"
                className="hidden lg:flex bg-gradient-primary hover:opacity-90 gap-1"
                onClick={onUpgrade}
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Upgrade</span>
              </Button>
            </>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="hover:bg-accent"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
              <div className="flex items-center justify-between p-2">
                <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:text-primary-foreground hover:bg-primary"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />

              {recentNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <>
                  {recentNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                        !notification.read ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex items-start justify-between w-full gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {!notification.read && (
                            <div className="flex-shrink-0 mt-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${!notification.read ? 'pl-4 text-muted-foreground' : 'pl-4 text-muted-foreground'}`}>
                        {notification.message.length > 100
                          ? `${notification.message.substring(0, 100)}...`
                          : notification.message}
                      </p>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-primary font-medium cursor-pointer"
                    onClick={() => navigate('/notifications')}
                  >
                    See all notifications
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                  {getDisplayName(user)}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink to="/profile" className="flex items-center w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/settings" className="flex items-center w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;