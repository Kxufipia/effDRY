/**
 * Extracts all unique keywords and their defaults from a template string.
 * Keywords are defined as text enclosed in curly braces, e.g., {keyword} or {keyword:default}.
 * 
 * @param {string} templateContent - The template string to parse.
 * @returns {Array<{key: string, default: string|null}>} An array of unique keyword objects.
 */
export function extractKeywords(templateContent) {
    if (!templateContent) return [];
    const regex = /{([^}]+)}/g;
    const simpleKeywords = new Set();
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
        const raw = match[1].trim();

        // Handle logic tags
        if (raw.startsWith('/')) continue; // Ignore closing tags {/if}
        if (raw.startsWith('#if ')) {     // Handle opening tags {#if var}
            simpleKeywords.add(raw.substring(4).trim());
            continue;
        }

        let [key] = raw.split(':');
        simpleKeywords.add(key.trim());
    }
    return Array.from(simpleKeywords);
}

/**
 * Extracts a map of variable defaults from a template.
 * @param {string} templateContent 
 * @returns {Object} Map of key -> defaultValue
 */
export function extractDefaults(templateContent) {
    if (!templateContent) return {};
    const regex = /{([^}]+)}/g;
    const defaults = {};
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
        const parts = match[1].split(':');
        if (parts.length > 1) {
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim(); // Handle joined colons in default?
            if (val) defaults[key] = val;
        }
    }
    return defaults;
}

/**
 * Replaces keywords in a template string with corresponding values.
 * Handles {key:default} syntax.
 * 
 * @param {string} templateContent - The template string containing placeholders.
 * @param {Object} values - An object where keys match the keywords in the template.
 * @returns {string} The interpolated string.
 */
export function interpolate(templateContent, values) {
    return templateContent.replace(/{([^}]+)}/g, (match, content) => {
        const [keyPart, ...defaultParts] = content.split(':');
        const key = keyPart.trim();
        const defaultValue = defaultParts.length > 0 ? defaultParts.join(':').trim() : match;

        // If value exists and is not empty, use it.
        // Otherwise use default value (if it's not the original match string).
        // If no default defined in template ({key}), defaultValue is "match" ({key}).
        // If values[key] is undefined, we return defaultValue.

        const val = values[key];
        if (val !== undefined && val !== '') {
            return val;
        }

        // If we have a custom default (not the original match), return it.
        // If defaultValue is strictly the match string (meaning no :default found), return match (preserve placeholder).
        if (defaultParts.length > 0) {
            return defaultValue;
        }

        return match;
    });
}

/**
 * Parses {#if variable}...{/if} blocks.
 * @param {string} content 
 * @param {Object} values 
 * @returns {string} Processed content
 */
export function parseLogic(content, values) {
    if (!content) return '';
    // Match {#if key}content{/if}
    // [\s\S] matches any char including newlines
    return content.replace(/{#if\s+([^}]+)}([\s\S]*?){\/if}/g, (match, key, blockContent) => {
        key = key.trim();
        const val = values[key];
        // Truthy check (handles boolean true, string "true", or non-empty string)
        if (val && val !== 'false') {
            return blockContent;
        }
        return '';
    });
}

/**
 * Scans template to determine variable types.
 * @param {string} content 
 * @returns {Object} Map of key -> 'boolean' | 'text'
 */
export function getVariableTypes(content) {
    const types = {};
    if (!content) return types;

    // Find boolean variables (used in #if)
    let match;
    const ifRegex = /{#if\s+([^}]+)}/g;
    while ((match = ifRegex.exec(content)) !== null) {
        const key = match[1].trim();
        types[key] = 'boolean';
    }

    // Find text variables (standard {})
    const varRegex = /{([^}]+)}/g;
    while ((match = varRegex.exec(content)) !== null) {
        const raw = match[1].trim();
        // Ignore tokens starting with # or /
        if (raw.startsWith('#') || raw.startsWith('/')) continue;

        let [key] = raw.split(':');
        key = key.trim();

        // Only set to text if not already marked as boolean (or prioritize text? logic implies boolean usually)
        // If a var is used in both {#if x} and {x}, treat as boolean to allow toggling?
        // Or treat as text? 
        // Let's default to 'text' if not found, but if found in #if, mark boolean.
        // Actually, if I write "Hello {show}" and also "{#if show}Big Show{/if}", 
        // I probably want a checkbox. If checked -> "Hello true" and "Big Show".
        // A checkbox returning "true"/"false" strings works for both.
        if (!types[key]) {
            types[key] = 'text';
        }
    }
    return types;
}
