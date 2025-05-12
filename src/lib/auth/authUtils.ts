
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logSystemEvent } from '@/lib/system/logSystemEvent';
import { AuthResponse, AuthError } from './types';

export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      throw signInError;
    }
    
    // Log successful sign in
    await logSystemEvent('auth', 'info', {
      event_type: 'user_signin',
      user_id: data.user?.id
    });
    
    toast({
      title: 'Signed in successfully',
      description: `Welcome back, ${data.user?.email}`,
    });
    
    return { user: data.user, session: data.session, error: undefined };
  } catch (err: any) {
    console.error('Error signing in:', err);
    
    toast({
      title: 'Sign in failed',
      description: err.message || 'Failed to sign in',
      variant: 'destructive',
    });
    
    return { user: null, session: null, error: err };
  }
}

export async function signUpWithEmailAndPassword(
  email: string, 
  password: string, 
  metadata?: object
): Promise<AuthResponse> {
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (signUpError) {
      throw signUpError;
    }
    
    // Log successful sign up
    await logSystemEvent('auth', 'info', {
      event_type: 'user_signup',
      user_id: data.user?.id
    });
    
    toast({
      title: 'Signed up successfully',
      description: 'Please check your email to verify your account',
    });
    
    return { user: data.user, session: data.session, error: undefined };
  } catch (err: any) {
    console.error('Error signing up:', err);
    
    toast({
      title: 'Sign up failed',
      description: err.message || 'Failed to sign up',
      variant: 'destructive',
    });
    
    return { user: null, session: null, error: err };
  }
}

export async function signOutUser(userId?: string): Promise<{ error: AuthError | null }> {
  try {
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      throw signOutError;
    }
    
    // Log successful sign out
    if (userId) {
      await logSystemEvent('auth', 'info', {
        event_type: 'user_signout',
        user_id: userId
      });
    }
    
    toast({
      title: 'Signed out successfully',
      description: 'You have been signed out',
    });
    
    return { error: null };
  } catch (err: any) {
    console.error('Error signing out:', err);
    
    toast({
      title: 'Sign out failed',
      description: err.message || 'Failed to sign out',
      variant: 'destructive',
    });
    
    return { error: err };
  }
}

export async function resetUserPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`
    });
    
    if (resetError) {
      throw resetError;
    }
    
    toast({
      title: 'Password reset email sent',
      description: 'Please check your email to reset your password',
    });
    
    return { error: null };
  } catch (err: any) {
    console.error('Error resetting password:', err);
    
    toast({
      title: 'Password reset failed',
      description: err.message || 'Failed to send password reset email',
      variant: 'destructive',
    });
    
    return { error: err };
  }
}

export async function updateUserPassword(newPassword: string): Promise<{ error: AuthError | null }> {
  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      throw updateError;
    }
    
    toast({
      title: 'Password updated',
      description: 'Your password has been updated successfully',
    });
    
    return { error: null };
  } catch (err: any) {
    console.error('Error updating password:', err);
    
    toast({
      title: 'Password update failed',
      description: err.message || 'Failed to update password',
      variant: 'destructive',
    });
    
    return { error: err };
  }
}
