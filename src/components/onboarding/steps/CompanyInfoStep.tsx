
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface CompanyInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  teamSize: string;
  setTeamSize: (value: string) => void;
  revenueRange: string;
  setRevenueRange: (value: string) => void;
}

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  teamSize,
  setTeamSize,
  revenueRange,
  setRevenueRange,
}) => {
  return (
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
  );
};

export default CompanyInfoStep;
