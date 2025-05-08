
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { OnboardingFormData } from '@/types/onboarding';

interface PersonaStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({ 
  formData,
  setFieldValue
}) => {
  const handleAddGoal = () => {
    const newGoals = [...(formData.persona?.goals || []), ''];
    setFieldValue('persona', { ...formData.persona, goals: newGoals });
  };

  const handleRemoveGoal = (index: number) => {
    const newGoals = [...(formData.persona?.goals || [])];
    newGoals.splice(index, 1);
    setFieldValue('persona', { ...formData.persona, goals: newGoals });
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...(formData.persona?.goals || [])];
    newGoals[index] = value;
    setFieldValue('persona', { ...formData.persona, goals: newGoals });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('persona', { ...formData.persona, name: e.target.value });
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('persona', { ...formData.persona, tone: e.target.value });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-2xl">Target Persona</CardTitle>
        <CardDescription>
          Define the target audience persona for your business strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div>
          <Label htmlFor="persona-name">Persona Name</Label>
          <Input
            id="persona-name"
            placeholder="e.g., Small Business Owner Sarah"
            value={formData.persona?.name || ''}
            onChange={handleNameChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Persona Goals</Label>
          <p className="text-sm text-muted-foreground mb-3">
            What are the main goals or pain points of this persona?
          </p>
          
          <div className="space-y-3">
            {formData.persona?.goals?.map((goal, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder={`Goal ${index + 1}`}
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveGoal(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              className="flex gap-1 items-center"
              onClick={handleAddGoal}
            >
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="persona-tone">Communication Tone</Label>
          <Input
            id="persona-tone"
            placeholder="e.g., Professional but friendly"
            value={formData.persona?.tone || ''}
            onChange={handleToneChange}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            The tone that best resonates with this persona
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaStep;
