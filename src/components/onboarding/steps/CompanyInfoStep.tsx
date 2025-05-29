import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingFormData } from "@/types/onboarding";

// Types and options for the company info form
const industries = [
  "Software Development",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Marketing",
  "Real Estate",
  "Other",
];

const companySizes = [
  "Solo entrepreneur",
  "2-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const revenueRanges = [
  "Pre-revenue",
  "$1-100K",
  "$100K-500K",
  "$500K-1M",
  "$1M-5M",
  "$5M-10M",
  "$10M-50M",
  "$50M+",
];

export interface CompanyInfoStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  formData,
  updateFormData,
}) => {
  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateFormData({ [name]: value });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Company Information</CardTitle>
        <CardDescription>
          Tell us about your business to help us create strategies tailored to
          your needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="Your company name"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => handleSelectChange("industry", value)}
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

        {/* Company Size */}
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => handleSelectChange("companySize", value)}
          >
            <SelectTrigger id="companySize">
              <SelectValue placeholder="How many employees?" />
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

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            name="website"
            placeholder="https://example.com"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Revenue Range */}
        <div className="space-y-2">
          <Label htmlFor="revenueRange">Annual Revenue Range</Label>
          <Select
            value={formData.revenueRange}
            onValueChange={(value) => handleSelectChange("revenueRange", value)}
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Brief description of what your company does..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoStep;
