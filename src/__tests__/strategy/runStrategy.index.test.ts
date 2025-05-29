import { describe } from "vitest";

// Import all test suites
import "./basic/runStrategy.basic.test";
import "./validation/inputValidation.test";
import "./error-handling/errorHandling.test";
import "./resilience/retryLogic.test";

describe("RunStrategy Tests", () => {
  // This is an umbrella test suite that allows running all tests together
  // Individual test files contain the actual test implementations
});
