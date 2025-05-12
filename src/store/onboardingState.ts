
import { create } from 'zustand';
import type { OnboardingState, OnboardingFormData, OnboardingStep } from '../types/onboarding';

// Initial form data with required fields
const initialFormData: OnboardingFormData = {
  companyName: '',
  industry: '',
  companySize: '',
  revenueRange: '',
  description: '',
  goals: [],
  persona: {
    name: '',
    goals: [],
    tone: ''
  }
};

// Initial state matching the OnboardingState interface
const initialState: OnboardingState = {
  step: 'welcome',
  formData: initialFormData,
  isSubmitting: false,
  isComplete: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState & {
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: OnboardingStep) => void;
  updateFormData: (d: Partial<OnboardingFormData>) => void;
  setSubmitting: (b: boolean) => void;
  setComplete: (b: boolean) => void;
  reset: () => void;
}>((set) => ({
  ...initialState,
  
  nextStep: () => set((state) => {
    // Map current step to next step
    const currentStep = state.step;
    let nextStep: OnboardingStep;
    
    switch (currentStep) {
      case 'welcome': nextStep = 'company-info'; break;
      case 'company-info': nextStep = 'persona'; break;
      case 'persona': nextStep = 'additional-info'; break;
      case 'additional-info': nextStep = 'strategy-generation'; break;
      case 'strategy-generation': nextStep = 'completed'; break;
      default: nextStep = 'completed';
    }
    
    return { step: nextStep };
  }),
  
  prevStep: () => set((state) => {
    // Map current step to previous step
    const currentStep = state.step;
    let prevStep: OnboardingStep;
    
    switch (currentStep) {
      case 'company-info': prevStep = 'welcome'; break;
      case 'persona': prevStep = 'company-info'; break;
      case 'additional-info': prevStep = 'persona'; break;
      case 'strategy-generation': prevStep = 'additional-info'; break;
      default: prevStep = 'welcome';
    }
    
    return { step: prevStep };
  }),
  
  setStep: (step) => set({ step }),
  updateFormData: (d) => set((s) => ({ formData: { ...s.formData, ...d } })),
  setSubmitting: (b) => set({ isSubmitting: b }),
  setComplete: (b) => set({ isComplete: b }),
  reset: () => set(initialState),
}));
