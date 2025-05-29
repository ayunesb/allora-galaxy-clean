/**
 * Display a success notification
 * @param message The message to display
 */
export function notifySuccess(message: string) {
  console.log("Success:", message);
}

/**
 * Display an error notification
 * @param message The error message to display
 */
export function notifyError(message: string) {
  console.error("Error:", message);
}
