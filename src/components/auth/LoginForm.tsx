
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface LoginProps {
  setIsLoading: (isLoading: boolean) => void;
}

export default function LoginForm({ setIsLoading }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Get redirect location from state if available
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
      // Redirect the user to the dashboard or intended destination
      navigate(from, { replace: true });
    } catch (error: any) {
      setAuthError(error.message || 'Failed to login. Please check your credentials.');
      toast({
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
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
        
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            {...register('password')}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
