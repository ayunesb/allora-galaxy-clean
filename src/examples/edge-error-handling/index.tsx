import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EdgeFunctionErrorPatterns from "./EdgeFunctionErrorPatterns";
import RetryMechanismExample from "./RetryMechanismExample";
import CustomErrorBoundaryExample from "./CustomErrorBoundaryExample";

const EdgeErrorHandlingExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Error Handling Examples</CardTitle>
          <CardDescription>
            Examples of different error handling techniques for edge functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patterns">
            <TabsList>
              <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
              <TabsTrigger value="retry">Retry Mechanism</TabsTrigger>
              <TabsTrigger value="boundary">Error Boundary</TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="mt-4">
              <EdgeFunctionErrorPatterns />
            </TabsContent>

            <TabsContent value="retry" className="mt-4">
              <RetryMechanismExample />
            </TabsContent>

            <TabsContent value="boundary" className="mt-4">
              <CustomErrorBoundaryExample />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeErrorHandlingExamples;
