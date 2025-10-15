import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import TopNavBar from './TopNavBar';
import DashboardSidebar from './DashboardSidebar';
import DashboardMain from './DashboardMain';
import UpgradeModal from '../modals/UpgradeModal';

const DashboardContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user } = useSelector((state: RootState) => state.session);
  const userPlan = (user?.plan?.toLowerCase() || 'base') as 'base' | 'pro';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
        <DashboardMain />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default DashboardContent;