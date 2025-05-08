
import React from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OnboardingFormData } from '@/types/onboarding';

export interface AdditionalInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ 
  formData,
  updateFormData,
  setFieldValue
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue('additionalInfo', e.target.value);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2 px-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Additional Information</CardTitle>
          <Badge variant="outline">Optional</Badge>
        </div>
        <CardDescription>
          Provide any additional context that will help us create a more tailored strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Context</Label>
          <Textarea
            id="additionalInfo"
            value={formData.additionalInfo || ''}
            onChange={handleChange}
            placeholder="Share any specific business challenges, goals, or context that might help with your strategy"
            rows={8}
          />
        </div>
        
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
          <p>
            <strong>Tips:</strong> You can mention specific challenges you're facing,
            what sets your business apart, or particular metrics you want to improve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoStep;
