
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { type PersonaStepProps } from '../StepContent';

const PersonaStep: React.FC<PersonaStepProps> = ({ 
  formData,
  updateFormData,
  setFieldValue
}) => {
  const [newGoal, setNewGoal] = React.useState('');

  const toneOptions = [
    'Professional',
    'Casual',
    'Friendly',
    'Authoritative',
    'Technical',
    'Inspirational',
    'Educational',
    'Persuasive'
  ];

  // Add a new goal to the persona
  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const updatedGoals = [...(formData.persona?.goals || []), newGoal];
    
    updateFormData({
      persona: {
        ...formData.persona,
        goals: updatedGoals
      }
    });
    
    setNewGoal('');
  };

  // Remove a goal from the persona
  const removeGoal = (index: number) => {
    const updatedGoals = [...(formData.persona?.goals || [])];
    updatedGoals.splice(index, 1);
    
    updateFormData({
      persona: {
        ...formData.persona,
        goals: updatedGoals
      }
    });
  };

  // Handle key press for adding goals
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGoal();
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-2xl">Target Persona</CardTitle>
        <CardDescription>
          Define your ideal customer persona to tailor your marketing strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2">
          <Label htmlFor="personaName">Persona Name</Label>
          <Input
            id="personaName"
            value={formData.persona?.name || ''}
            onChange={(e) => 
              updateFormData({
                persona: {
                  ...formData.persona,
                  name: e.target.value
                }
              })
            }
            placeholder="e.g., Marketing Director Mary"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="personaTone">Communication Tone</Label>
          <Select
            value={formData.persona?.tone || ''}
            onValueChange={(value) => 
              updateFormData({
                persona: {
                  ...formData.persona,
                  tone: value
                }
              })
            }
          >
            <SelectTrigger id="personaTone">
              <SelectValue placeholder="Select communication tone" />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="personaGoals">Persona Goals</Label>
          <div className="flex space-x-2">
            <Input
              id="newGoal"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., Increase conversion rate"
              className="flex-1"
            />
            <Button type="button" onClick={addGoal}>Add</Button>
          </div>
          
          {/* Display added goals */}
          {formData.persona?.goals && formData.persona.goals.length > 0 ? (
            <div className="mt-3 space-y-2">
              {formData.persona.goals.map((goal, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between px-3 py-1.5 bg-muted rounded-md"
                >
                  <span>{goal}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeGoal(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No goals added yet. Add some goals to better tailor the strategy.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaStep;
