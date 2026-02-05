export function extractKeywords(templateContent) {
    const regex = /{([^}]+)}/g;
    const keywords = new Set();
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
        keywords.add(match[1].trim());
    }
    return Array.from(keywords);
}

export function interpolate(templateContent, values) {
    return templateContent.replace(/{([^}]+)}/g, (match, key) => {
        return values[key.trim()] || match;
    });
}
