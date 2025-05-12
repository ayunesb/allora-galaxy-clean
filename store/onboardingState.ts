const initialState: OnboardingState = {
  currentStep: 0,
  formData: { /* ...all your fields... */ },
  isSubmitting: false,
  isComplete: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingState & OnboardingAction>((set) => ({
  ...initialState,
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  // ...other actions...
}));
