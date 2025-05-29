import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EdgeFunctionErrorDisplay } from "@/components/errors/EdgeFunctionErrorHandler";
import { useState } from "react";

export default function ErrorHandlingDemo() {
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);
	const [requestId, setRequestId] = useState<string | null>(null);

	const triggerError = async (errorType: string) => {
		setLoading(true);
		setError(null);
		setRequestId(null);

		try {
			const response = await fetch(
				`/api/demo-error-handling?type=${errorType}`
			);
			const data = await response.json();

			if (!response.ok) {
				// Extract request ID if available
				const reqId = response.headers.get("x-request-id") || data.requestId;
				if (reqId) {
					setRequestId(reqId);
				}

				// Create error object with additional properties
				const error = new Error(data.error || "Unknown error");
				Object.assign(error, {
					status: response.status,
					requestId: reqId,
					details: data.details,
					code: data.code,
				});

				throw error;
			}

			// Success case
			alert("Success! This should not happen when testing errors.");
		} catch (err: any) {
			console.error("Error in demo:", err);
			setError(err);
		} finally {
			setLoading(false);
		}
	};

	const handleRetry = () => {
		alert("Retry action triggered!");
		setError(null);
	};

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<h3 className="font-medium mb-2">Authentication Error</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Simulates a 401 unauthorized error
						</p>
						<Button
							onClick={() => triggerError("auth")}
							disabled={loading}
							variant="outline"
						>
							Trigger Auth Error
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<h3 className="font-medium mb-2">Validation Error</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Simulates a 400 bad request with validation details
						</p>
						<Button
							onClick={() => triggerError("validation")}
							disabled={loading}
							variant="outline"
						>
							Trigger Validation Error
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<h3 className="font-medium mb-2">Server Error</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Simulates a 500 internal server error
						</p>
						<Button
							onClick={() => triggerError("server")}
							disabled={loading}
							variant="outline"
						>
							Trigger Server Error
						</Button>
					</CardContent>
				</Card>
			</div>

			{error && (
				<div className="mt-8">
					<h3 className="text-lg font-medium mb-4">Error Response:</h3>
					<EdgeFunctionErrorDisplay
						error={error}
						retry={handleRetry}
						showDetails={true}
						showRequestId={true}
					/>
					{requestId && (
						<div className="mt-2 text-sm text-muted-foreground">
							Request ID: {requestId}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
