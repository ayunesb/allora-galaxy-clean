import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const StrategyBuilder: React.FC = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleCreateStrategy = async () => {
		setIsLoading(true);
		// In a real app, this would create a strategy
		setTimeout(() => {
			setIsLoading(false);
			navigate("/dashboard");
		}, 1500);
	};

	const handleCancel = () => {
		navigate("/dashboard");
	};

	return (
		<div className="container mx-auto py-8 max-w-5xl">
			<h1 className="text-3xl font-bold mb-6">Create New Strategy</h1>

			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-8 w-64 mb-4" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-10 w-32" />
				</div>
			) : (
				<>
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Strategy Details</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Strategy builder content goes here.</p>
						</CardContent>
					</Card>

					<div className="flex justify-end gap-3">
						<Button variant="outline" onClick={handleCancel}>
							Cancel
						</Button>
						<Button onClick={handleCreateStrategy}>Create Strategy</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default StrategyBuilder;
