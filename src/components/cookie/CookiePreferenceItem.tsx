
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferenceItemProps {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const CookiePreferenceItem: React.FC<CookiePreferenceItemProps> = ({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <Label htmlFor={`cookie-${title}`} className="text-base font-medium">
          {title}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={`cookie-${title}`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default CookiePreferenceItem;
