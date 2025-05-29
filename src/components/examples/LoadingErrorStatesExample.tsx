import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataStateHandler } from "@/components/ui/data-state-handler";
import { notifyError } from "@/lib/notifications/toast";

interface MockData {
  id: number;
  name: string;
  description: string;
  status: "loading" | "success" | "error";
  message?: string;
}

const LoadingErrorStatesExample: React.FC = () => {
  const [data, setData] = useState<MockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate an API call
    const fetchData = async () => {
      try {
        // Simulate loading state
        setLoading(true);
        setError(null);

        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate success
        setData({
          id: 1,
          name: "Example Data",
          description: "This is example data loaded from an API.",
          status: "success",
          message: "Data loaded successfully!",
        });
      } catch (e: any) {
        // Simulate error state
        const formattedError =
          e instanceof Error
            ? e
            : new Error(e?.message || "Failed to load data.");
        setError(formattedError);
        notifyError(formattedError.message || "Failed to load data.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [partialData, setPartialData] = useState<MockData | null>(null);
  const [partialLoading, setPartialLoading] = useState(true);
  const [partialError, setPartialError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate an API call
    const fetchPartialData = async () => {
      try {
        // Simulate loading state
        setPartialLoading(true);
        setPartialError(null);

        // Simulate API call with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate success
        setPartialData({
          id: 2,
          name: "Partial Data",
          description: "This is partial data that might fail to load.",
          status: "success",
          message: "Partial data loaded successfully!",
        });
      } catch (e: any) {
        // Simulate error state
        const formattedError =
          e instanceof Error
            ? e
            : new Error(e?.message || "Failed to load partial data.");
        setPartialError(formattedError);
        notifyError(formattedError.message || "Failed to load partial data.");
        setPartialData(null);
      } finally {
        setPartialLoading(false);
      }
    };

    fetchPartialData();
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        Loading & Error State Examples
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Full Data Loading</CardTitle>
            <CardDescription>
              Demonstrates a full loading state with potential error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataStateHandler
              isLoading={loading}
              error={error}
              data={data}
              loadingComponent={<Skeleton className="w-full h-40" />}
              errorComponent={
                <div className="text-red-500">
                  {error?.message || "An error occurred"}
                </div>
              }
            >
              <div>{data?.message}</div>
            </DataStateHandler>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partial Data Loading</CardTitle>
            <CardDescription>
              Demonstrates a partial loading state within a component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataStateHandler
              isLoading={partialLoading}
              error={partialError}
              data={partialData}
              loadingComponent={<Skeleton className="w-full h-32" />}
              errorComponent={
                <div className="text-red-500">
                  {partialError?.message || "An error occurred"}
                </div>
              }
            >
              {partialData && <div>{partialData.description}</div>}
            </DataStateHandler>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoadingErrorStatesExample;
