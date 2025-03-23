
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "./AuthContext";
import { fetchUserRole, clearUserRoleCache } from "./utils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      console.log("Starting checkAuth process");
      setIsLoading(true);
      
      // Check if there's an active session
      const { data: { user } } = await supabase.auth.getUser();
      console.log("checkAuth - user:", user);
      
      setUser(user);
      
      if (user) {
        console.log("User is authenticated, fetching role for ID:", user.id);
        const role = await fetchUserRole(user.id);
        console.log("Fetched role:", role);
        setUserRole(role);
      } else {
        console.log("No authenticated user found");
        // Clear cached role when user is not authenticated
        clearUserRoleCache(user?.id);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setUserRole(null);
    } finally {
      console.log("checkAuth complete");
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log("Starting signOut process");
    
    try {
      // Clear cached role before signing out
      clearUserRoleCache(user?.id);
      
      // First attempt to sign out from Supabase
      const { error: supabaseError } = await supabase.auth.signOut();
      
      if (supabaseError) {
        console.error("Supabase signOut error:", supabaseError);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Sign out failed: ${supabaseError.message}`
        });
        return;
      }
      
      console.log("Supabase signOut successful, clearing local state");
      
      // Then clear local state regardless of the result
      setUser(null);
      setUserRole(null);
      
      // Notify the user
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out."
      });
      
      console.log("signOut process completed successfully");
      
      // Force redirect to landing page
      window.location.href = "/";
    } catch (error) {
      // This would catch any unexpected errors
      console.error("Unexpected error during signOut:", error);
      
      // Still clear state even if there was an error
      setUser(null);
      setUserRole(null);
      
      toast({
        variant: "destructive",
        title: "Warning",
        description: "There was an issue signing out, but your session has been cleared."
      });
      
      // Still attempt redirection
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // Initial auth check with a proper async IIFE 
    (async () => {
      console.log("Initializing auth");
      try {
        await checkAuth();
      } catch (error) {
        console.error("Error during initial auth check:", error);
        setIsLoading(false);
      }
    })();
    
    // Extended timeout for auth check - give more time on first load
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth check timeout - forcing loading to complete");
        setIsLoading(false);
      }
    }, 5000); // Give it 5 seconds instead of 3
    
    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Sign in event detected, setting user");
        setUser(session.user);
        
        // Fetch and set the user role
        console.log("Fetching role after sign in for user ID:", session.user.id);
        const role = await fetchUserRole(session.user.id);
        console.log("Role after sign in:", role);
        setUserRole(role);
        
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("Signed out event received");
        setUser(null);
        setUserRole(null);
        setIsLoading(false);
      } else if (event === 'USER_UPDATED') {
        console.log("User updated event received");
        if (session?.user) {
          setUser(session.user);
          // Refresh the role when user is updated
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
        }
        setIsLoading(false);
      } else {
        // For other events, just ensure we're not stuck in loading
        setIsLoading(false);
      }
    });
    
    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, isLoading, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
