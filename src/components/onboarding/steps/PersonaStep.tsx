
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { OnboardingFormData } from '@/types/onboarding';
import { Badge } from '@/components/ui/badge';

export interface PersonaStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setFieldValue: (key: string, value: any) => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({ 
  formData, 
  updateFormData,
  setFieldValue
}) => {
  const { persona } = formData;
  
  // Add a new goal
  const handleAddGoal = () => {
    if (persona.goals.length >= 5) return; // Limit to 5 goals
    
    setFieldValue('persona', {
      ...persona,
      goals: [...persona.goals, '']
    });
  };
  
  // Update a goal at specific index
  const handleGoalChange = (index: number, value: string) => {
    const updatedGoals = [...persona.goals];
    updatedGoals[index] = value;
    
    setFieldValue('persona', {
      ...persona,
      goals: updatedGoals
    });
  };
  
  // Remove a goal at specific index
  const handleRemoveGoal = (index: number) => {
    setFieldValue('persona', {
      ...persona,
      goals: persona.goals.filter((_, i) => i !== index)
    });
  };
  
  // Handle changes to persona name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('persona', {
      ...persona,
      name: e.target.value
    });
  };
  
  // Handle changes to persona tone
  const handleToneChange = (value: string) => {
    setFieldValue('persona', {
      ...persona,
      tone: value
    });
  };
  
  // Available tone options
  const toneOptions = [
    'Professional', 
    'Friendly', 
    'Technical', 
    'Conversational', 
    'Formal', 
    'Casual'
  ];

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Target Persona</CardTitle>
        <CardDescription>
          Define your ideal customer persona to help AI generate better strategies.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Persona name */}
        <div className="space-y-2">
          <Label htmlFor="personaName">Persona Name</Label>
          <Input
            id="personaName"
            placeholder="e.g. Marketing Manager Mary"
            value={persona.name}
            onChange={handleNameChange}
          />
        </div>
        
        {/* Persona goals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="personaGoals">Goals & Objectives</Label>
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              onClick={handleAddGoal}
              disabled={persona.goals.length >= 5}
            >
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Goal
            </Button>
          </div>
          
          {persona.goals.length > 0 ? (
            <div className="space-y-3">
              {persona.goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Goal ${index + 1}`}
                    value={goal}
                    onChange={(e) => handleGoalChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveGoal(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground">
                No goals added. Add goals to help AI understand the persona better.
              </p>
            </div>
          )}
        </div>
        
        {/* Persona tone */}
        <div className="space-y-2">
          <Label htmlFor="personaTone">Communication Tone</Label>
          <Select
            value={persona.tone}
            onValueChange={handleToneChange}
          >
            <SelectTrigger id="personaTone">
              <SelectValue placeholder="Select a tone for customer communications" />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {persona.tone && (
            <div className="mt-2">
              <Badge variant="outline">{persona.tone}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaStep;
