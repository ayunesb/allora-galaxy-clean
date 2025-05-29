import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DeletionRequestsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Deletion Requests</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Deletion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No deletion requests found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeletionRequestsPage;
