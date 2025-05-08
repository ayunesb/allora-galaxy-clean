
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingFormData } from '@/types/onboarding';

interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  isSubmitting: boolean;
  isComplete: boolean;
  tenantId: string | null;
  
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setField: (key: string, value: any) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setComplete: (isComplete: boolean, tenantId?: string) => void;
  resetOnboarding: () => void;
}

const initialFormData: OnboardingFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  revenueRange: '',
  website: '',
  description: '',
  goals: [],
  additionalInfo: '',
  persona: {
    name: '',
    goals: [],
    tone: ''
  }
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      formData: initialFormData,
      isSubmitting: false,
      isComplete: false,
      tenantId: null,
      
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      
      updateFormData: (data) => 
        set((state) => ({ 
          formData: { ...state.formData, ...data } 
        })),
        
      setField: (key, value) => 
        set((state) => {
          // Handle nested properties like 'persona.name'
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
          
          // Handle direct properties
          return {
            formData: {
              ...state.formData,
              [key]: value
            }
          };
        }),
        
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setComplete: (isComplete, tenantId = null) => set({ isComplete, tenantId }),
      resetOnboarding: () => set({ 
        currentStep: 0, 
        formData: initialFormData,
        isSubmitting: false,
        isComplete: false,
        tenantId: null
      }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
