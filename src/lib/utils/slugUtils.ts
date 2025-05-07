
/**
 * Generate a slug from a string (e.g., company name)
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim()                   // Trim whitespace from start and end
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
};

/**
 * Ensure a slug is unique by appending a number if needed
 * @param slug Base slug
 * @param existingSlugs Array of existing slugs to check against
 * @returns A unique slug
 */
export const ensureUniqueSlug = (slug: string, existingSlugs: string[]): string => {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Validate if a string can be used as a slug
 * @param slug The slug to validate
 * @returns True if the slug is valid
 */
export const isValidSlug = (slug: string): boolean => {
  // Slugs should be lowercase, contain only alphanumeric chars and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 63;
};
