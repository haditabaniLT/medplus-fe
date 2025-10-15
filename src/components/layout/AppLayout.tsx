import React, { useEffect } from 'react';
import { Layout, Menu, Switch, Typography, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { checkSessionTimeout } from '../../store/slices/sessionSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { LayoutProps } from '../../types';
import { cn } from '../../lib/utils';


const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC<LayoutProps> = ({
  children,
  sidebar = true,
  header = true,
  className,
}) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.session);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const logout = (str: string) => { }

  useEffect(() => {
    // Apply theme class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Check session timeout periodically
    const interval = setInterval(() => {
      dispatch(checkSessionTimeout());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    logout('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'theme',
      icon: <BulbOutlined />,
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Dark Mode</span>
          <Switch
            size="small"
            checked={isDark}
            onChange={handleThemeToggle}
            className="ml-2"
          />
        </div>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const sidebarMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <Layout className={cn('min-h-screen bg-background', className)}>
      {sidebar && (
        <Sider
          className="bg-card border-r border-border shadow-sm"
          theme={isDark ? 'dark' : 'light'}
          width={250}
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">App Dashboard</h2>
          </div>
          <Menu
            theme={isDark ? 'dark' : 'light'}
            mode="inline"
            defaultSelectedKeys={['dashboard']}
            items={sidebarMenuItems}
            className="bg-transparent border-0"
          />
        </Sider>
      )}

      <Layout>
        {header && (
          <Header className="bg-card border-b border-border shadow-sm px-6 flex items-center justify-between">
            <Text className="text-lg font-semibold text-foreground">
              Welcome back, {user?.username}!
            </Text>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-3 cursor-pointer hover:bg-accent px-3 py-2 rounded-lg transition-colors">
                <Avatar icon={<UserOutlined />} className="bg-primary" />
                <div className="hidden tablet:block desktop:block">
                  <Text className="text-foreground font-medium">{user?.username}</Text>
                  <br />
                  <Text className="text-muted-foreground text-xs">{user?.role}</Text>
                </div>
              </div>
            </Dropdown>
          </Header>
        )}

        <Content className="p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;