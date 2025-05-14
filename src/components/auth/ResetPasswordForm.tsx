
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], 
});

interface ResetPasswordProps {
  setIsLoading: (isLoading: boolean) => void;
}

export default function ResetPasswordForm({ setIsLoading }: ResetPasswordProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });
      
      // Redirect to login page after successful password reset
      navigate('/auth/login');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to reset password. Please try again.');
      toast({
        title: 'Password reset failed',
        description: error.message || 'An error occurred during password reset',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
        
        <div className="space-y-1">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            {...register('password')}
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            {...register('confirmPassword')}
            placeholder="••••••••"
            type="password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Reset Password
      </Button>
    </form>
  );
}
