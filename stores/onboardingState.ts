import create from 'zustand';

interface OnboardingState {
  currentStep: number;
  // Add other required keys here
}

const initialState: OnboardingState = {
  currentStep: 0,
  // Add other required keys here
};

const useOnboardingWizard = create<OnboardingState>((set) => ({
  ...initialState,
  setCurrentStep: (currentStep: number) => set((state) => ({
    ...state,
    currentStep,
  })),
}));

export default useOnboardingWizard;