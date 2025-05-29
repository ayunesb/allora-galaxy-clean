/**
 * Cookie management utilities
 */

/**
 * Get a cookie value and parse it as JSON
 * @param name Cookie name
 * @returns Parsed cookie value or null if not found
 */
export function getCookie<T = any>(name: string): T | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      try {
        return JSON.parse(decodeURIComponent(cookieValue)) as T;
      } catch (e) {
        return decodeURIComponent(cookieValue) as unknown as T;
      }
    }
  }
  return null;
}

/**
 * Set a cookie with a value, serializing objects to JSON
 * @param name Cookie name
 * @param value Cookie value (will be JSON stringified if object)
 * @param maxAge Maximum age in seconds
 * @param path Cookie path
 */
export function setCookie(
  name: string,
  value: any,
  maxAge: number = 86400, // 1 day default
  path: string = "/",
  secure: boolean = true,
): void {
  if (typeof document === "undefined") return;

  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  const encodedValue = encodeURIComponent(stringValue);

  const cookieOptions = [
    `${name}=${encodedValue}`,
    `max-age=${maxAge}`,
    `path=${path}`,
    secure ? "secure" : "",
    "SameSite=Lax",
  ]
    .filter(Boolean)
    .join("; ");

  document.cookie = cookieOptions;
}

/**
 * Delete a cookie by setting its expiration in the past
 * @param name Cookie name
 * @param path Cookie path
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
