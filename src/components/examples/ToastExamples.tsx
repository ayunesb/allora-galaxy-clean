import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ToastExamples: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Examples</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Toast Types</CardTitle>
            <CardDescription>Standard toast notifications</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button onClick={() => toast("Default notification")}>
              Default
            </Button>
            <Button
              onClick={() => toast.success("Operation completed")}
              variant="outline"
            >
              Success
            </Button>
            <Button
              onClick={() => toast.error("Something went wrong")}
              variant="destructive"
            >
              Error
            </Button>
            <Button
              onClick={() => toast.warning("Be careful")}
              variant="outline"
              className="border-yellow-500 text-yellow-500"
            >
              Warning
            </Button>
            <Button
              onClick={() => toast.info("For your information")}
              variant="outline"
              className="border-blue-500 text-blue-500"
            >
              Info
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Options</CardTitle>
            <CardDescription>Toast with additional details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              onClick={() =>
                toast("With description", {
                  description: "This toast has additional details.",
                })
              }
            >
              With Description
            </Button>
            <Button
              onClick={() =>
                toast("With action", {
                  action: {
                    label: "Undo",
                    onClick: () => toast.info("Action clicked"),
                  },
                })
              }
            >
              With Action
            </Button>
            <Button
              onClick={() => {
                const toastId = toast.loading("Processing...");
                setTimeout(() => {
                  toast.success("Completed!", {
                    id: toastId,
                  });
                }, 2000);
              }}
            >
              Loading → Success
            </Button>
            <Button
              onClick={() =>
                toast("Custom duration", {
                  duration: 10000,
                })
              }
            >
              Long Duration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promise Handling</CardTitle>
            <CardDescription>Toast for async operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: "Loading...",
                    success: "Successfully completed",
                    error: "Something went wrong",
                  },
                );
              }}
            >
              Promise (Success)
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                toast.promise(
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Failed")), 2000),
                  ),
                  {
                    loading: "Loading...",
                    success: "This should not show",
                    error: "Operation failed",
                  },
                );
              }}
            >
              Promise (Error)
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => {
                    setTimeout(
                      () => resolve({ id: 123, name: "Sample" }),
                      2000,
                    );
                  }),
                  {
                    loading: "Creating resource...",
                    success: (data) => {
                      // You can use the resolved data in the success message
                      return `Resource created with ID: ${JSON.stringify(data)}`;
                    },
                    error: "Failed to create resource",
                  },
                );
              }}
            >
              Promise with Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Positioning & Styling</CardTitle>
            <CardDescription>Custom appearance options</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                toast("Custom styling", {
                  className: "bg-purple-500 text-white",
                  description: "This toast has custom styling",
                  descriptionClassName: "text-purple-100",
                });
              }}
            >
              Custom Style
            </Button>
            <Button
              onClick={() => {
                toast("With icon", {
                  icon: "🔥",
                });
              }}
            >
              With Icon
            </Button>
            <Button
              onClick={() => {
                toast("Important message", {
                  important: true,
                  description: "This toast will not be automatically dismissed",
                });
              }}
            >
              Important (No Auto-dismiss)
            </Button>
            <Button
              onClick={() => {
                toast("Multiple lines", {
                  description:
                    "This is a very long description that should wrap to multiple lines. It contains a lot of text to demonstrate how the toast handles overflow.",
                });
              }}
            >
              Long Content
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToastExamples;
