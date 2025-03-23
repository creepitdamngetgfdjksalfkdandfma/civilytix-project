
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthCheckProps {
  isLoading: boolean;
}

const AuthCheck = ({ isLoading }: AuthCheckProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Checking authentication...</span>
      </div>
    );
  }
  
  return (
    <div className="p-6 rounded-lg border border-red-300 bg-red-50 text-red-800">
      <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
      <p className="mb-4">You need to be logged in to view this page.</p>
      <Button onClick={() => navigate("/auth")}>
        Go to Login
      </Button>
    </div>
  );
};

export default AuthCheck;
