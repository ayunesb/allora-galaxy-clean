
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

interface ForgotPasswordProps {
  setIsLoading: (isLoading: boolean) => void;
}

export default function ForgotPasswordForm({ setIsLoading }: ForgotPasswordProps) {
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      
      toast({
        title: 'Reset email sent',
        description: 'Check your email for the reset link',
      });
    } catch (error: any) {
      setAuthError(error.message || 'Failed to send reset email. Please try again.');
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            If an account exists with that email, we've sent a password reset link.
            Please check your email.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
          Enter your email and we'll send you a link to reset your password.
        </p>
        
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...register('email')}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
