
/**
 * @file Aspect Ratio Component
 * Maintains consistent width-to-height ratio for content
 * 
 * This component wraps content and maintains a specified aspect ratio,
 * useful for images, videos, and other media elements.
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

/**
 * AspectRatio Component
 * 
 * Maintains a consistent width-to-height ratio for its children.
 * 
 * @component
 * @example
 * ```tsx
 * <div className="w-[300px]">
 *   <AspectRatio ratio={16/9}>
 *     <img
 *       src="https://example.com/image.jpg"
 *       alt="Example"
 *       className="h-full w-full object-cover"
 *     />
 *   </AspectRatio>
 * </div>
 * ```
 * 
 * @property {number} ratio - The aspect ratio to maintain (width/height)
 * @property {ReactNode} children - The content to display within the aspect ratio container
 */
const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
