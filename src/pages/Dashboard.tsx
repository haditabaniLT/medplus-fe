import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import DashboardContent from '../components/dashboard/DashboardContent';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.session);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <DashboardContent />;
};

export default Dashboard;