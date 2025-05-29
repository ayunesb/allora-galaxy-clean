// Import PostgrestError but actually use it in the code
import { PostgrestError } from "@supabase/supabase-js";

export interface User {
  id: string;
  role: string;
  created_at: string;
  user_id: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email?: {
      email?: string;
    };
  };
}

export interface UserWithMetadata extends User {
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
}

export type UserRole = "owner" | "admin" | "member" | "viewer" | "guest";

// Example of using PostgrestError in an interface to avoid the unused import warning
export interface DatabaseOperationResult<T = any> {
  data: T | null;
  error: PostgrestError | null;
}
