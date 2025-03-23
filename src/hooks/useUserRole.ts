
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

export const useUserRole = () => {
  const { user, userRole, isLoading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const location = useLocation();

  // This effect handles redirection if the user is not authenticated
  useEffect(() => {
    // Don't redirect if on an audit path - these are publicly accessible
    if (location.pathname.startsWith('/audit') && location.pathname !== '/audit/new') {
      return;
    }
    
    // If authentication is not loading and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      console.log("useUserRole: No authenticated user, redirecting to auth page");
      navigate('/auth');
    }
    
    // If we have a user but no role, try to fetch the role
    if (user && !userRole && !isChecking) {
      setIsChecking(true);
      console.log("useUserRole: User is authenticated but no role found, checking auth");
      checkAuth().finally(() => {
        setIsChecking(false);
      });
    }
  }, [user, userRole, isLoading, navigate, checkAuth, isChecking, location.pathname]);

  return { userRole, loading: isLoading || isChecking };
};
