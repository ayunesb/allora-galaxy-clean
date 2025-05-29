import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { AuthResponse, AuthError } from "./types";
import { notify, notifyError } from "@/lib/notifications/toast";

export async function signInWithEmailAndPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      throw signInError;
    }

    // Log successful sign in
    await logSystemEvent("auth", "info", {
      event_type: "user_signin",
      user_id: data.user?.id,
      description: "User signed in",
    });

    notify(`Signed in successfully. Welcome back, ${data.user?.email}`);
    return { user: data.user, error: null };
  } catch (error: unknown) {
    console.error("Error signing in:", error);
    notifyError((error as AuthError).message || "Failed to sign in");
    return { user: null, error: error as AuthError };
  }
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  metadata?: object,
): Promise<AuthResponse> {
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    // Log successful sign up
    await logSystemEvent("auth", "info", {
      event_type: "user_signup",
      user_id: data.user?.id,
      description: "User signed up",
    });

    notify(
      "Signed up successfully. Please check your email to verify your account",
    );
    return { user: data.user, error: null };
  } catch (error: unknown) {
    console.error("Error signing up:", error);
    notifyError((error as AuthError).message || "Failed to sign up");
    return { user: null, error: error as AuthError };
  }
}

export async function signOutUser(
  userId?: string,
): Promise<{ error: AuthError | null }> {
  try {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw signOutError;
    }

    // Log successful sign out
    if (userId) {
      await logSystemEvent("auth", "info", {
        event_type: "user_signout",
        user_id: userId,
        description: "User signed out",
      });
    }

    notify("Signed out successfully. You have been signed out");
    return { error: null };
  } catch (error: unknown) {
    console.error("Error signing out:", error);
    notifyError((error as AuthError).message || "Failed to sign out");
    return { error: error as AuthError };
  }
}

export async function resetUserPassword(
  email: string,
): Promise<{ error: AuthError | null }> {
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/update-password`,
      },
    );

    if (resetError) {
      throw resetError;
    }

    notify(
      "Password reset email sent. Please check your email to reset your password",
    );
    return { error: null };
  } catch (error: unknown) {
    console.error("Error resetting password:", error);
    notifyError((error as AuthError).message || "Failed to send password reset email");
    return { error: error as AuthError };
  }
}

export async function updateUserPassword(
  newPassword: string,
): Promise<{ error: AuthError | null }> {
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    notify("Password updated. Your password has been updated successfully");
    return { error: null };
  } catch (error: unknown) {
    console.error("Error updating password:", error);
    notifyError((error as AuthError).message || "Failed to update password");
    return { error: error as AuthError };
  }
}
