
export interface OnboardingFormData {
  // Company information
  company: {
    name: string;
    industry?: string;
    size?: string;
    website?: string;
    description?: string;
  };
  
  // User information
  user: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
  };
  
  // Persona/goals
  persona?: {
    name?: string;
    goals?: string[];
    tone?: string;
  };
  
  // Strategy generation
  strategy?: {
    title?: string;
    description?: string;
    tags?: string[];
    status?: string;
  };
  
  // Tenant information
  tenant?: {
    name?: string;
    slug?: string;
    id?: string;
  };
  
  // Progress tracking
  currentStep?: number;
  completedSteps?: number[];
}

export interface OnboardingStep {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isOptional?: boolean;
  component: React.ComponentType<any>;
}
