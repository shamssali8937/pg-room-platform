/**
 * sanitize.util.ts
 *
 * Strips HTML tags, script content, and dangerous attributes from
 * user-supplied strings to prevent stored XSS attacks.
 *
 * This is intentionally dependency-free — it uses a safe regex approach
 * to remove tags without parsing HTML, which is sufficient for plain-text
 * fields (names, descriptions, comments) that are never intended to contain HTML.
 */

/**
 * Removes all HTML tags and decodes common HTML entities from a string.
 * Safe for use in Zod `.transform()` callbacks.
 *
 * @example
 * stripHtml('<script>alert(1)</script>Hello')  // → 'Hello'
 * stripHtml('<b>Bold</b> text')               // → 'Bold text'
 * stripHtml('  padded  ')                     // → 'padded'
 */
export function stripHtml(value: string): string {
    if (typeof value !== "string") return value;

    return value
        // Remove script and style blocks including their content
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        // Remove all remaining HTML tags
        .replace(/<[^>]*>/g, "")
        // Decode common HTML entities
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&#39;/g, "'")
        // Strip any remaining raw angle brackets that could form tags after entity decode
        .replace(/<[^>]*>/g, "")
        // Trim whitespace
        .trim();
}

/**
 * Zod-compatible transform that strips HTML from a string.
 * Use inside z.string().transform(sanitizeString).
 */
export const sanitizeString = (val: string): string => stripHtml(val);
