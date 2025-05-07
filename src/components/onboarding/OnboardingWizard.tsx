
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Entertainment',
  'Food & Beverage',
  'Travel',
  'Other',
];

const teamSizes = [
  { value: 'solo', label: 'Solo (1 person)' },
  { value: 'small', label: 'Small (2-10 people)' },
  { value: 'medium', label: 'Medium (11-50 people)' },
  { value: 'large', label: 'Large (51-500 people)' },
  { value: 'enterprise', label: 'Enterprise (500+ people)' },
];

const revenueRanges = [
  'Pre-revenue',
  '$1 - $100k',
  '$100k - $1M',
  '$1M - $10M',
  '$10M - $100M',
  '$100M+',
];

const tones = [
  'Professional',
  'Casual',
  'Friendly',
  'Technical',
  'Creative',
  'Bold',
  'Conversational',
];

const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const { createTenant, tenants } = useWorkspace();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company profile data
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [revenueRange, setRevenueRange] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Persona profile data
  const [personaName, setPersonaName] = useState('');
  const [tone, setTone] = useState('');
  const [goals, setGoals] = useState('');

  // Redirect to dashboard if user already has tenants
  if (tenants.length > 0) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create new tenant
      const { data: tenant, error: tenantError } = await createTenant(companyName);

      if (tenantError) throw tenantError;

      // Create company profile
      const { error: companyError } = await supabase
        .from('company_profiles')
        .insert({
          tenant_id: tenant!.id,
          name: companyName,
          industry,
          size: teamSize,
          revenue_range: revenueRange,
          website,
          description,
        });

      if (companyError) throw companyError;

      // Create persona profile
      const { error: personaError } = await supabase
        .from('persona_profiles')
        .insert({
          tenant_id: tenant!.id,
          name: personaName,
          tone,
          goals: goals.split('\n').filter(goal => goal.trim() !== ''),
        });

      if (personaError) throw personaError;

      toast({
        title: 'Onboarding complete!',
        description: 'Your workspace has been set up successfully.',
      });

      // Redirect to dashboard
      window.location.href = '/';

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Onboarding failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Company Information',
      description: 'Tell us about your company',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-size">Team Size</Label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                {teamSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue Range</Label>
            <Select value={revenueRange} onValueChange={setRevenueRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select revenue range" />
              </SelectTrigger>
              <SelectContent>
                {revenueRanges.map((range) => (
                  <SelectItem key={range} value={range}>{range}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Additional Information',
      description: 'Provide more details about your company',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your company..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Persona Settings',
      description: 'Define your brand persona and goals',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">Persona Name</Label>
            <Input
              id="persona-name"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              placeholder="e.g., Marketing Team, Sales Department"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tone">Preferred Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals">Business Goals</Label>
            <Textarea
              id="goals"
              placeholder="Enter your business goals, one per line..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">Enter each goal on a new line</p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={currentStep === steps.length - 1 ? handleSubmit : undefined}>
            <div className="mb-6">
              <Progress value={((currentStep + 1) / steps.length) * 100} />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{(((currentStep + 1) / steps.length) * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            {currentStepData.content}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 0 && (!companyName || !industry || !teamSize || !revenueRange)) ||
                    isSubmitting
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!personaName || !tone || !goals || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
