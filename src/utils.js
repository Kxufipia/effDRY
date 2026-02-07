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
    const keywords = new Map(); // Use Map to track unique keys but keep first found default
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
        const raw = match[1];
        let [key, defaultValue] = raw.split(':').map(s => s.trim());
        if (!defaultValue) defaultValue = null;

        if (!keywords.has(key)) {
            keywords.set(key, defaultValue);
        } else if (defaultValue && !keywords.get(key)) {
            // Update existing key if we found a default value later (optional behavior)
            keywords.set(key, defaultValue);
        }
    }
    // Return array of objects for easier consumption, or just keys if we want backward compat
    // For now, let's return just keys to avoid breaking existing consumers, 
    // BUT we need a way to get defaults. 
    // Actually, let's return strings (keys) here for backward compat with Set() usage in Editor,
    // and create a new function for rich extraction if needed?
    // Wait, the plan said "Return objects {key, default}".
    // Let's check usages. Editor.js uses `extractKeywords(t.content).forEach(k => allKeywords.add(k))`
    // If we return objects, `allKeywords` (a Set) will contain objects. Converting to Array from Set of objects works but `has` checks fail.
    // We should probably keep `extractKeywords` returning strings for compatibility, 
    // and add `extractVariables` for the rich data.

    // REVISED PLAN inline:
    // 1. `extractKeywords` returns just unique keys (strings) as before, but strips defaults.
    // 2. `extractVariableDefaults` returns a map of key -> default.
    // OR simplify: just handle the stripping in `extractKeywords` so {name:John} returns "name".

    const simpleKeywords = new Set();
    while ((match = regex.exec(templateContent)) !== null) {
        let [key] = match[1].split(':');
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
