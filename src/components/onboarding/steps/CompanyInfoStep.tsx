import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  type CompanyInfoStepProps 
} from '../StepContent';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormData } from '@/types/onboarding';

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  formData,
  setFieldValue,
}) => {
  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const industries = [
    'Software & IT',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Manufacturing',
    'Marketing & Advertising',
    'Consulting',
    'Real Estate',
    'Other'
  ];

  const revenueRanges = [
    'Pre-revenue',
    'Under $100K',
    '$100K - $500K',
    '$500K - $1M',
    '$1M - $5M',
    '$5M - $10M',
    '$10M - $50M',
    '$50M+'
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-2xl">Company Information</CardTitle>
        <CardDescription>
          Tell us about your company so we can generate tailored strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => setFieldValue('companyName', e.target.value)}
            placeholder="Enter your company name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => setFieldValue('industry', value)}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => setFieldValue('companySize', value)}
          >
            <SelectTrigger id="companySize">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="revenueRange">Annual Revenue</Label>
          <Select
            value={formData.revenueRange}
            onValueChange={(value) => setFieldValue('revenueRange', value)}
          >
            <SelectTrigger id="revenueRange">
              <SelectValue placeholder="Select revenue range" />
            </SelectTrigger>
            <SelectContent>
              {revenueRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website || ''}
            onChange={(e) => setFieldValue('website', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoStep;
