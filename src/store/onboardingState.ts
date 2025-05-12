import { create } from 'zustand';
import type { OnboardingState, OnboardingFormData } from '../types';

const initialState: OnboardingState = {
  currentStep: 0,
  formData: { /* defaults */ },
  isSubmitting: false,
  isComplete: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState & {
  nextStep: () => void;
  prevStep: () => void;
  setStep: (n: number) => void;
  updateFormData: (d: Partial<OnboardingFormData>) => void;
  setSubmitting: (b: boolean) => void;
  setComplete: (b: boolean) => void;
  reset: () => void;
}>(set => ({
  ...initialState,
  nextStep: () => set(s => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set(s => ({ currentStep: s.currentStep - 1 })),
  setStep: n => set({ currentStep: n }),
  updateFormData: d => set(s => ({ formData: { ...s.formData, ...d } })),
  setSubmitting: b => set({ isSubmitting: b }),
  setComplete: b => set({ isComplete: b }),
  reset: () => set(initialState),
}));
