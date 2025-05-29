import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function WorkspaceOverview() {
  const { currentWorkspace } = useWorkspace();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Overview</CardTitle>
        <CardDescription>Details about the current workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        {currentWorkspace ? (
          <>
            <p>Name: {currentWorkspace.name}</p>
            <p>ID: {currentWorkspace.id}</p>
            {currentWorkspace.description && (
              <p>Description: {currentWorkspace.description}</p>
            )}
          </>
        ) : (
          <p>No workspace selected.</p>
        )}
      </CardContent>
    </Card>
  );
}
