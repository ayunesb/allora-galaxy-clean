
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

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface RegisterProps {
  setIsLoading: (isLoading: boolean) => void;
}

export default function RegisterForm({ setIsLoading }: RegisterProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setAuthError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Registration successful',
        description: 'Please check your email to confirm your account',
      });
      
      // Redirect to login page after successful registration
      navigate('/auth/login');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to register. Please try again.');
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
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
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        
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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  );
}
