import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormData } from '@/types/onboarding';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface PersonaStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({
  formData,
  updateFormData,
}) => {
  const [newGoal, setNewGoal] = React.useState('');

  const handleAddGoal = () => {
    if (newGoal.trim() !== '') {
      updateFormData({
        persona: {
          ...formData.persona,
          goals: [...(formData.persona.goals || []), newGoal.trim()],
        },
      });
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    updateFormData({
      persona: {
        ...formData.persona,
        goals: (formData.persona.goals || []).filter((goal) => goal !== goalToRemove),
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Persona Name */}
      <FormField
        control={{ name: 'persona.name' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Persona Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Marketing Manager"
                value={formData.persona.name || ''}
                onChange={(e) => updateFormData({ persona: { ...formData.persona, name: e.target.value } })}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Who are you trying to reach?
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Persona Goals */}
      <div>
        <FormLabel>Target Persona Goals</FormLabel>
        <div className="flex items-center space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Add a goal"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />
          <Button type="button" size="sm" onClick={handleAddGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.persona.goals || []).map((goal) => (
            <Badge key={goal} variant="secondary" className="flex items-center space-x-1">
              <span>{goal}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveGoal(goal)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Persona Tone */}
      <FormField
        control={{ name: 'persona.tone' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Communication Tone</FormLabel>
            <Select
              onValueChange={(value) => updateFormData({ persona: { ...formData.persona, tone: value } })}
              defaultValue={formData.persona.tone || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="informal">Informal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How should the communication sound?
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Additional Persona Details */}
      <FormField
        control={{ name: 'persona.details' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Details</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., What are their pain points?"
                value={formData.persona.details || ''}
                onChange={(e) => updateFormData({ persona: { ...formData.persona, details: e.target.value } })}
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Any other relevant information about your target persona?
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonaStep;
