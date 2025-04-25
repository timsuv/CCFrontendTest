import React from "react";
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({adminOnly = false}) => {
    const {user, loading, isAuthenticated} = useAuth();

    if (loading){
        return <div>Loading...</div>
    }
    if (!isAuthenticated){
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'admin'){
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}
export default ProtectedRoute;