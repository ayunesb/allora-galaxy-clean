import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { StrategyGenerationStepProps } from "../StepContent";

const StrategyGenerationStep: React.FC<StrategyGenerationStepProps> = ({
  formData,
  isGenerating = false,
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-2xl">Generate Your Strategy</CardTitle>
        <CardDescription>
          We're ready to create your business strategy based on the information
          you've provided
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <div className="rounded-lg border bg-card px-6 py-4">
          <h3 className="text-lg font-medium mb-2">Business Summary</h3>

          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium">Company</div>
              <div>{formData.companyName || "(Not provided)"}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Industry</div>
                <div>{formData.industry || "(Not provided)"}</div>
              </div>
              <div>
                <div className="font-medium">Size</div>
                <div>{formData.companySize || "(Not provided)"}</div>
              </div>
            </div>

            <div>
              <div className="font-medium">Target Persona</div>
              <div>{formData.persona?.name || "(Not provided)"}</div>
            </div>

            {formData.persona?.goals && formData.persona.goals.length > 0 && (
              <div>
                <div className="font-medium">Persona Goals</div>
                <ul className="list-disc list-inside">
                  {formData.persona.goals.map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-dashed p-6 text-center">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div>
                <div className="text-lg font-medium mb-1">
                  Creating your strategy
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI is analyzing your inputs and crafting your strategy.
                  This may take a moment...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Ready to Generate</h3>
              <p className="text-muted-foreground">
                Click the "Create Strategy" button below to generate your custom
                business strategy
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyGenerationStep;
