
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AdditionalInfoStepProps {
  website: string;
  setWebsite: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({
  website,
  setWebsite,
  description,
  setDescription,
}) => {
  return (
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
  );
};

export default AdditionalInfoStep;
