
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Special handling for audit routes - PUBLIC ACCESS FOR ALL USERS
  if (location.pathname.startsWith('/audit')) {
    console.log("Audit route access check:", { userRole, path: location.pathname, isAuthenticated: !!user, allowedRoles });
    
    // For /audit/new, only government users can access
    if (location.pathname === '/audit/new' && userRole !== 'government') {
      console.log("Restricting /audit/new to government only");
      return <Navigate to="/" replace />;
    }
    
    // For all other audit routes, allow access without authentication
    return <>{children}</>;
  }

  // For non-audit routes, use standard role checking
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
