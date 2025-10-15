import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import DashboardContent from "../components/dashboard/DashboardContent";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.session);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if user needs to complete onboarding
    if (user && !user.onboarding) {
      navigate("/onboarding");
      return;
    }

    // If authenticated and onboarding is complete, redirect to dashboard
    if (isAuthenticated && user?.onboarding) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Show loading while redirecting
  return <div>Redirecting...</div>;
};

export default Index;
