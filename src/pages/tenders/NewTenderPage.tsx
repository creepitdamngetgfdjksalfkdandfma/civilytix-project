
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateTenderForm from "./CreateTenderForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NewTenderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');
  const nodeId = queryParams.get('nodeId');
  const nodePrice = queryParams.get('price') ? parseFloat(queryParams.get('price')!) : null;
  const nodeName = queryParams.get('nodeName');
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // If we came from a project, go back to that project
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate(-1);
      }
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step > 1 ? "Previous Step" : "Back"}
        </Button>
        <h1 className="text-3xl font-bold">Create New Tender</h1>
        {projectId && (
          <p className="text-gray-600 mt-2">
            Creating a tender for project ID: {projectId}
            {nodeName && ` (Component: ${nodeName})`}
            {nodePrice && ` with estimated price: $${nodePrice.toLocaleString()}`}
          </p>
        )}
        <div className="mt-4 flex space-x-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i + 1 <= step ? "bg-primary" : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>
      </div>

      <CreateTenderForm 
        step={step} 
        onNext={handleNext} 
        projectId={projectId}
        nodeId={nodeId}
        nodePrice={nodePrice}
        nodeName={nodeName}
        onComplete={(tenderId) => {
          navigate(`/tenders/${tenderId}`);
        }}
      />
    </div>
  );
};

export default NewTenderPage;
