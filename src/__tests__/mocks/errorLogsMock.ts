import { SystemLog, ErrorTrendDataPoint } from "@/types/logs";

/**
 * Mock error trend data for testing charts
 */
export const mockErrorTrendData: ErrorTrendDataPoint[] = [
	{
		date: "2023-01-01",
		count: 5,
		total: 100,
		critical: 1,
		high: 2,
		medium: 1,
		low: 1,
	},
	{
		date: "2023-01-02",
		count: 8,
		total: 120,
		critical: 2,
		high: 3,
		medium: 2,
		low: 1,
	},
	{
		date: "2023-01-03",
		count: 3,
		total: 95,
		critical: 0,
		high: 1,
		medium: 1,
		low: 1,
	},
	{
		date: "2023-01-04",
		count: 12,
		total: 150,
		critical: 3,
		high: 5,
		medium: 2,
		low: 2,
	},
	{
		date: "2023-01-05",
		count: 6,
		total: 110,
		critical: 1,
		high: 2,
		medium: 2,
		low: 1,
	},
];

/**
 * Mock error logs for testing
 */
export const mockErrorLogs: SystemLog[] = [
	{
		id: "1",
		tenant_id: "tenant-1",
		level: "error",
		message: "Database connection failed",
		description: "Failed to connect to the database after 3 retries",
		module: "database",
		details: {
			connectionString: "postgresql://localhost:5432/db",
			retries: 3,
			errorCode: "ECONNREFUSED",
		},
		created_at: "2023-01-01T10:00:00Z",
		severity: "critical",
		request_id: "req-123",
		timestamp: "2023-01-01T10:00:00Z",
	},
	{
		id: "2",
		tenant_id: "tenant-1",
		level: "error",
		message: "API request failed",
		description: "The external API returned a 500 status code",
		module: "api",
		details: {
			endpoint: "/users",
			statusCode: 500,
			response: { error: "Internal Server Error" },
		},
		created_at: "2023-01-01T11:15:00Z",
		severity: "high",
		request_id: "req-124",
		timestamp: "2023-01-01T11:15:00Z",
	},
	{
		id: "3",
		tenant_id: "tenant-2",
		level: "error",
		message: "Payment processing failed",
		description: "Credit card declined by payment processor",
		module: "payments",
		details: {
			paymentId: "pay-456",
			errorCode: "card_declined",
			processor: "stripe",
		},
		created_at: "2023-01-02T09:30:00Z",
		severity: "high",
		request_id: "req-125",
		timestamp: "2023-01-02T09:30:00Z",
	},
	{
		id: "4",
		tenant_id: "tenant-1",
		level: "error",
		message: "Authentication failed",
		description: "Invalid credentials provided",
		module: "auth",
		details: {
			method: "password",
			attempts: 3,
		},
		created_at: "2023-01-03T14:20:00Z",
		severity: "medium",
		request_id: "req-126",
		timestamp: "2023-01-03T14:20:00Z",
	},
	{
		id: "5",
		tenant_id: "tenant-3",
		level: "error",
		message: "File upload failed",
		description: "Could not upload file to storage",
		module: "storage",
		details: {
			fileSize: "15MB",
			fileName: "report.pdf",
			errorCode: "STORAGE_ERROR",
		},
		created_at: "2023-01-04T08:45:00Z",
		severity: "medium",
		request_id: "req-127",
		timestamp: "2023-01-04T08:45:00Z",
	},
];

export default { mockErrorTrendData, mockErrorLogs };
