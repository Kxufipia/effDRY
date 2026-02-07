/**
 * Extracts all unique keywords from a template string.
 * Keywords are defined as text enclosed in curly braces, e.g., {keyword}.
 * 
 * @param {string} templateContent - The template string to parse.
 * @returns {string[]} An array of unique keywords found in the template.
 */
export function extractKeywords(templateContent) {
    const regex = /{([^}]+)}/g;
    const keywords = new Set();
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
        keywords.add(match[1].trim());
    }
    return Array.from(keywords);
}

/**
 * Replaces keywords in a template string with corresponding values.
 * 
 * @param {string} templateContent - The template string containing placeholders.
 * @param {Object} values - An object where keys match the keywords in the template.
 * @returns {string} The interpolated string.
 */
export function interpolate(templateContent, values) {
    return templateContent.replace(/{([^}]+)}/g, (match, key) => {
        return values[key.trim()] || match;
    });
}
