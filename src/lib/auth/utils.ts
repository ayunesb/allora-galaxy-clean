import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

/**
 * Sign in a user with email and password
 */
export const signInWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  } catch (err) {
    console.error("Error signing in:", err);
    return { error: err as AuthError };
  }
};

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmailPassword = async (
  email: string,
  password: string,
) => {
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  } catch (err) {
    console.error("Error signing up:", err);
    return { error: err as AuthError };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Error signing out:", err);
    throw err;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  } catch (err) {
    console.error("Error resetting password:", err);
    return { error: err as AuthError };
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  } catch (err) {
    console.error("Error updating password:", err);
    return { error: err as AuthError };
  }
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return { session: data.session, error: null };
  } catch (err) {
    console.error("Error getting session:", err);
    return { session: null, error: err as AuthError };
  }
};
