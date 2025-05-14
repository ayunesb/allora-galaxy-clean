
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export type VoteType = 'up' | 'down';

export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  requiredRole?: UserRole | UserRole[];
  children?: NavigationItem[];
  isNew?: boolean;
  isExternal?: boolean;
}

export enum OnboardingStep {
  WELCOME = 'welcome',
  COMPANY_INFO = 'company_info',
  PERSONA = 'persona',
  ADDITIONAL_INFO = 'additional_info',
  STRATEGY_GENERATION = 'strategy_generation',
  COMPLETE = 'complete'
}

export interface SystemEventModule {
  name: string;
  value: string;
  icon?: React.ComponentType;
}
