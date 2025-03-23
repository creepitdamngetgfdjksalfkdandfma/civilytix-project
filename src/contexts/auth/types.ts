
export interface AuthContextType {
  user: any | null;
  userRole: string | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}
