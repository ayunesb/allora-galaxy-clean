
import { create } from 'zustand';
import { OnboardingFormData, OnboardingState, OnboardingAction, OnboardingStep } from '@/types/onboarding';

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
  currentStep: 0,
  formData: initialFormData,
  isComplete: false,
  tenantId: undefined,
  isSubmitting: false,
};

// Create onboarding store
export const useOnboardingStore = create<OnboardingState & OnboardingAction>((set) => ({
  ...initialState,
  
  // Step navigation
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  setStep: (step: number) => set({ currentStep: step }),
  
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
    const state = useOnboardingStore.getState();
    
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
