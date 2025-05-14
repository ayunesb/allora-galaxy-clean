
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EdgeFunctionErrorPatterns() {
  const [activePattern, setActivePattern] = useState<string | null>(null);
  
  // Example error patterns and their solutions
  const errorPatterns = {
    validation: {
      problem: `{
  "error": "Validation Error: 'tenantId' is required",
  "code": "VALIDATION_ERROR",
  "status": 400
}`,
      solution: `// Client-side validation
const schema = z.object({
  tenantId: z.string().uuid(),
  data: z.object({ ... })
});

// Validate before sending
const validated = schema.safeParse(input);
if (!validated.success) {
  return handleValidationError(validated.error);
}`
    },
    authorization: {
      problem: `{
  "error": "Unauthorized: Missing or invalid token",
  "code": "UNAUTHORIZED",
  "status": 401
}`,
      solution: `// Edge function protection
export const handler = async (req, res) => {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return createErrorResponse(
      "Unauthorized: Missing token", 
      401, 
      "UNAUTHORIZED"
    );
  }
  
  // Verify token and proceed
  // ...
}`
    },
    notFound: {
      problem: `{
  "error": "Resource not found: Tenant with ID '123' does not exist",
  "code": "NOT_FOUND",
  "status": 404
}`,
      solution: `// Check existence before operations
const { data: tenant, error } = await supabase
  .from('tenants')
  .select('id')
  .eq('id', tenantId)
  .single();

if (error || !tenant) {
  return createErrorResponse(
    \`Resource not found: Tenant with ID '\${tenantId}' does not exist\`,
    404,
    "NOT_FOUND"
  );
}`
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Error Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Common edge function error patterns and how to handle them properly.
          Click on a pattern to see examples.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activePattern === 'validation' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActivePattern('validation')}
          >
            Validation Errors
          </Button>
          <Button 
            variant={activePattern === 'authorization' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActivePattern('authorization')}
          >
            Auth Errors
          </Button>
          <Button 
            variant={activePattern === 'notFound' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActivePattern('notFound')}
          >
            Not Found Errors
          </Button>
        </div>
        
        {activePattern && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Pattern</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {errorPatterns[activePattern as keyof typeof errorPatterns].problem}
                </pre>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recommended Solution</h3>
              <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                {errorPatterns[activePattern as keyof typeof errorPatterns].solution}
              </pre>
            </div>
          </div>
        )}
        
        {!activePattern && (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">
              Select an error pattern above to view details
            </p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Best practices for edge function error handling:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use standardized error response structures</li>
            <li>Include helpful error messages and codes</li>
            <li>Validate input data early</li>
            <li>Handle authentication and authorization correctly</li>
            <li>Provide client-friendly error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
