import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import TopNavBar from '../dashboard/TopNavBar';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import UpgradeModal from '../modals/UpgradeModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useSelector((state: RootState) => state.session);
  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavBar onMenuToggle={toggleSidebar} onUpgrade={handleUpgrade} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <DashboardSidebar 
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          userPlan={userPlan}
          onUpgrade={handleUpgrade}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default DashboardLayout;
