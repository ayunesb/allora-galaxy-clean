
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormData } from '@/types/onboarding';

interface AdditionalInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({
  formData,
  updateFormData
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
    // Ensure additionalInfo is an object
    const additionalInfo = typeof formData.additionalInfo === 'object' 
      ? formData.additionalInfo 
      : { 
          targetAudience: '',
          keyCompetitors: '',
          uniqueSellingPoints: ''
        };
    
    // Update the specific field in additionalInfo
    const updatedAdditionalInfo = {
      ...additionalInfo,
      [field]: e.target.value
    };
    
    // Update the form data
    updateFormData({
      additionalInfo: updatedAdditionalInfo
    });
  };

  // Safely get values from additionalInfo whether it's an object or not
  const getAdditionalInfoField = (field: string): string => {
    if (!formData.additionalInfo) return '';
    if (typeof formData.additionalInfo === 'string') return '';
    return (formData.additionalInfo as any)[field] || '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Additional Information</h2>
      <p className="text-center text-muted-foreground">
        Tell us more about your business to help us create an effective strategy.
      </p>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Who is your target audience?</Label>
            <Textarea
              id="targetAudience"
              placeholder="Describe your ideal customer or audience"
              value={getAdditionalInfoField('targetAudience')}
              onChange={(e) => handleChange(e, 'targetAudience')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyCompetitors">Who are your key competitors?</Label>
            <Textarea
              id="keyCompetitors"
              placeholder="List your main competitors and what makes them stand out"
              value={getAdditionalInfoField('keyCompetitors')}
              onChange={(e) => handleChange(e, 'keyCompetitors')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniqueSellingPoints">What are your unique selling points?</Label>
            <Textarea
              id="uniqueSellingPoints"
              placeholder="What makes your company, product, or service different from the competition?"
              value={getAdditionalInfoField('uniqueSellingPoints')}
              onChange={(e) => handleChange(e, 'uniqueSellingPoints')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalInfoStep;
