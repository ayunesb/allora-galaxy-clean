
import { create } from 'zustand';
import { OnboardingFormData, OnboardingState, OnboardingStep, OnboardingStore } from '@/types/onboarding';

// Initial form data state
const initialFormData: OnboardingFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  revenueRange: '',
  website: '',
  description: '',
  goals: [] as string[],
  additionalInfo: '',
  persona: {
    name: '',
    goals: [] as string[],
    tone: ''
  }
};

// Initial onboarding state
const initialState: OnboardingState = {
  step: 'welcome', // Use an OnboardingStep value
  formData: initialFormData,
  isComplete: false,
  tenantId: undefined,
  isSubmitting: false,
  error: null
};

// Create onboarding store
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,
  
  // Step navigation
  nextStep: () => {
    const currentStep = get().step;
    let nextStep: OnboardingStep = 'welcome';
    
    switch (currentStep) {
      case 'welcome':
        nextStep = 'company-info';
        break;
      case 'company-info':
        nextStep = 'persona';
        break;
      case 'persona':
        nextStep = 'additional-info';
        break;
      case 'additional-info':
        nextStep = 'strategy-generation';
        break;
      default:
        nextStep = 'completed';
    }
    
    set({ step: nextStep });
  },
  
  prevStep: () => {
    const currentStep = get().step;
    let prevStep: OnboardingStep = 'welcome';
    
    switch (currentStep) {
      case 'company-info':
        prevStep = 'welcome';
        break;
      case 'persona':
        prevStep = 'company-info';
        break;
      case 'additional-info':
        prevStep = 'persona';
        break;
      case 'strategy-generation':
        prevStep = 'additional-info';
        break;
      default:
        prevStep = 'welcome';
    }
    
    set({ step: prevStep });
  },
  
  setStep: (step: OnboardingStep) => set({ step }),
  
  // Form data management
  updateFormData: (data: Partial<OnboardingFormData>) => 
    set((state) => ({ formData: { ...state.formData, ...data } })),
  
  setField: (key: string, value: any) => set((state) => {
    // Handle nested keys like 'persona.name'
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      return {
        formData: {
          ...state.formData,
          [parent]: {
            ...(state.formData[parent as keyof OnboardingFormData] as Record<string, any>),
            [child]: value
          }
        }
      };
    }
    
    // Handle regular keys
    return {
      formData: {
        ...state.formData,
        [key]: value
      }
    };
  }),
  
  // Reset to initial state
  reset: () => set(initialState),
  
  // Status management
  setSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  
  // Completion
  setComplete: (isComplete: boolean, tenantId?: string) => set({ 
    isComplete, 
    tenantId: tenantId || undefined 
  }),
  
  // Validation helpers
  validateStep: (step: OnboardingStep): boolean => {
    const state = get();
    
    switch (step) {
      case 'company-info':
        return !!state.formData.companyName && !!state.formData.industry;
      
      case 'persona':
        return !!state.formData.persona?.name;
      
      case 'additional-info':
        return true; // Optional step
      
      case 'strategy-generation':
        return true; // Just confirmation step
      
      default:
        return false;
    }
  }
}));
