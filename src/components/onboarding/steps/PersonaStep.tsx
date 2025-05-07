
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const tones = [
  'Professional',
  'Casual',
  'Friendly',
  'Technical',
  'Creative',
  'Bold',
  'Conversational',
];

interface PersonaStepProps {
  personaName: string;
  setPersonaName: (value: string) => void;
  tone: string;
  setTone: (value: string) => void;
  goals: string;
  setGoals: (value: string) => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({
  personaName,
  setPersonaName,
  tone,
  setTone,
  goals,
  setGoals,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="persona-name">Persona Name</Label>
        <Input
          id="persona-name"
          value={personaName}
          onChange={(e) => setPersonaName(e.target.value)}
          placeholder="e.g., Marketing Team, Sales Department"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tone">Preferred Tone</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            {tones.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="goals">Business Goals</Label>
        <Textarea
          id="goals"
          placeholder="Enter your business goals, one per line..."
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">Enter each goal on a new line</p>
      </div>
    </div>
  );
};

export default PersonaStep;
