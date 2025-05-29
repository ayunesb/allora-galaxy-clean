import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthContextType } from "@/lib/auth/types";

// Create the context with undefined as initial value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use the implementation from hooks/useAuth.tsx
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export { useAuth };

export function checkUserRole(user: { role?: string }, allowedRoles: string[]): boolean {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}
