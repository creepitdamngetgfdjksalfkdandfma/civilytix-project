
import { supabase } from "@/integrations/supabase/client";

export const fetchUserRole = async (userId: string) => {
  console.log("Fetching role for user ID:", userId);
  
  try {
    // First try to get role from localStorage cache to avoid database query
    const cachedRole = localStorage.getItem(`user_role_${userId}`);
    if (cachedRole) {
      console.log("Found cached role:", cachedRole);
      return cachedRole;
    }
    
    // If no cached role, fetch from database
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    console.log("User profile data:", data);
    
    // Cache the role for future use
    if (data?.role) {
      localStorage.setItem(`user_role_${userId}`, data.role);
    }
    
    return data?.role || null;
  } catch (err) {
    console.error("Unexpected error fetching user role:", err);
    return null;
  }
};

export const clearUserRoleCache = (userId: string | undefined) => {
  if (userId) {
    localStorage.removeItem(`user_role_${userId}`);
  }
};
