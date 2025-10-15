import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * AdminDashboard - Deprecated in v2.0
 * 
 * This component now serves as a redirect to the Faculty Dashboard.
 * In version 2.0, the admin role has been removed and all admin privileges
 * have been transferred to the faculty role.
 * 
 * This file is kept for backward compatibility and will redirect users
 * to the appropriate dashboard based on their role.
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect faculty users to faculty dashboard
    if (user && user.role === 'faculty') {
      navigate('/faculty-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // If not logged in or not faculty, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is student, redirect to student dashboard
  if (user.role === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  }

  // Show loading while redirecting
  return <LoadingSpinner text="Redirecting to Faculty Dashboard..." />;
};

export default AdminDashboard;