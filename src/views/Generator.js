import { store } from '../store.js'
import { extractKeywords, extractDefaults, interpolate } from '../utils.js'

// Cache input values by topic ID to persist data when switching tabs.
// In a larger app, this would be part of the global store.
const valuesCache = {};

/**
 * Renders the Generator view where users input data and see results.
 * 
 * @param {HTMLElement} container - The DOM element to render content into.
 * @param {Object} topic - The current topic object containing templates and settings.
 */
export function renderGenerator(container, topic) {
    // Initialize cache for this topic if missing
    if (!valuesCache[topic.id]) valuesCache[topic.id] = {};
    const values = valuesCache[topic.id];

    // Clear container to prevent duplication (e.g. on Reset)
    container.innerHTML = '';

    const wrapper = document.createElement('div');

    // =========================================
    // 1. INPUT FORM SECTION
    // =========================================

    // Collect all unique keywords from all templates in this topic
    const keywords = new Set();
    topic.templates.forEach(t => {
        extractKeywords(t.content).forEach(k => keywords.add(k));
    });

    if (keywords.size > 0) {
        // --- Header (Title & Reset Button) ---
        const headerNodes = document.createElement('div');
        headerNodes.style.display = 'flex';
        headerNodes.style.justifyContent = 'space-between';
        headerNodes.style.alignItems = 'center';
        headerNodes.style.marginBottom = '15px';

        const title = document.createElement('h3');
        title.style.fontSize = '1rem';
        title.style.textTransform = 'uppercase';
        title.style.opacity = '0.7';
        title.style.margin = '0';
        title.textContent = '1. Enter Keywords';

        const resetBtn = document.createElement('button');
        resetBtn.className = 'secondary';
        resetBtn.textContent = 'Reset Inputs';
        resetBtn.style.fontSize = '0.8rem';
        resetBtn.onclick = () => {
            if (confirm('Clear all inputs?')) {
                Object.keys(values).forEach(k => delete values[k]);
                // Re-render inputs to clear them visually
                renderGenerator(container, topic);
            }
        };

        headerNodes.append(title, resetBtn);
        wrapper.appendChild(headerNodes);

        // --- Keyword Inputs Grid ---
        const form = document.createElement('div');
        form.className = 'grid mb-4';
        form.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';

        // Sort keywords based on user-defined order (topic.keywordOrder)
        const sortedKeywords = Array.from(keywords);
        if (topic.keywordOrder && topic.keywordOrder.length > 0) {
            sortedKeywords.sort((a, b) => {
                const idxA = topic.keywordOrder.indexOf(a);
                const idxB = topic.keywordOrder.indexOf(b);
                // If both found in custom order, sort by index
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                // If only A found, A comes first
                if (idxA !== -1) return -1;
                // If only B found, B comes first
                if (idxB !== -1) return 1;
                // If neither, fallback to alphabetical
                return a.localeCompare(b);
            });
        } else {
            sortedKeywords.sort(); // Default alphabetical
        }

        // Collect defaults
        const defaults = {};
        topic.templates.forEach(t => {
            Object.assign(defaults, extractDefaults(t.content));
        });

        // Loop inputs and set initial values if empty
        sortedKeywords.forEach(k => {
            // Pre-fill default if available and no user value yet
            if (!values[k] && defaults[k]) {
                values[k] = defaults[k];
            }
        });

        // Render input fields
        sortedKeywords.forEach(k => {
            const field = document.createElement('div');

            const label = document.createElement('label');
            const mappings = topic.keywordMappings || {};
            // Use custom label if available, otherwise use keyword key
            label.textContent = mappings[k] || k;
            if (mappings[k]) {
                label.style.fontWeight = 'bold';
                label.style.color = 'var(--text-color)';
            }
            label.style.display = 'block';
            label.style.marginBottom = '4px';
            label.style.fontSize = '0.8rem';
            label.style.color = '#ce9178';

            const input = document.createElement('input');
            input.value = values[k] || '';
            input.placeholder = defaults[k] ? `Default: ${defaults[k]}` : `Value for ${k}...`;

            // Real-time update
            input.oninput = (e) => {
                values[k] = e.target.value;
                renderPreviews(); // Refresh previews immediately
            };

            field.append(label, input);
            form.appendChild(field);
        });
        wrapper.appendChild(form);

        const divider = document.createElement('hr');
        divider.style.borderColor = 'var(--border-color)';
        divider.style.margin = '2rem 0';
        wrapper.appendChild(divider);
    }

    // =========================================
    // 2. OUTPUT PREVIEWS SECTION
    // =========================================
    const previewHeader = document.createElement('h3');
    previewHeader.innerHTML = '2. Generated Results';
    previewHeader.style.fontSize = '1rem';
    previewHeader.style.marginBottom = '15px';
    previewHeader.style.textTransform = 'uppercase';
    previewHeader.style.opacity = '0.7';
    wrapper.appendChild(previewHeader);

    const outputs = document.createElement('div');
    outputs.className = 'grid';
    outputs.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))'; // Wider cards

    /**
     * Renders the preview cards based on current input values.
     * Called initially and on every input change.
     */
    function renderPreviews() {
        outputs.innerHTML = '';
        if (topic.templates.length === 0) {
            outputs.innerHTML = '<div style="opacity:0.5">No templates defined in this topic.</div>';
            return;
        }

        topic.templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'template-card';

            const head = document.createElement('div');
            head.className = 'template-header';

            const btnContainer = document.createElement('div');
            btnContainer.className = 'flex-row';
            btnContainer.style.gap = '5px';

            const copyTextBtn = document.createElement('button');
            copyTextBtn.className = 'icon-btn';
            copyTextBtn.innerHTML = '📄 <span style="font-size:0.8rem">Text</span>';
            copyTextBtn.title = "Copy Plain Text";
            copyTextBtn.onclick = () => {
                const plainText = text.replace(/<[^>]+>/g, ''); // Simple strip tags
                navigator.clipboard.writeText(plainText).then(() => {
                    copyTextBtn.innerHTML = '✅ <span style="font-size:0.8rem">Text</span>';
                    setTimeout(() => copyTextBtn.innerHTML = '📄 <span style="font-size:0.8rem">Text</span>', 1000);
                });
            };

            const copyHtmlBtn = document.createElement('button');
            copyHtmlBtn.className = 'icon-btn';
            copyHtmlBtn.innerHTML = '📋 <span style="font-size:0.8rem">HTML</span>';
            copyHtmlBtn.title = "Copy HTML Code";
            copyHtmlBtn.onclick = () => {
                navigator.clipboard.writeText(text).then(() => {
                    copyHtmlBtn.innerHTML = '✅ <span style="font-size:0.8rem">HTML</span>';
                    setTimeout(() => copyHtmlBtn.innerHTML = '📋 <span style="font-size:0.8rem">HTML</span>', 1000);
                });
            };

            btnContainer.append(copyTextBtn, copyHtmlBtn);
            head.appendChild(btnContainer);

            let previewContent;
            if (t.isRichText) {
                previewContent = document.createElement('div');
                previewContent.style.padding = '15px';
                previewContent.innerHTML = text; // Render as HTML
            } else {
                previewContent = document.createElement('pre');
                previewContent.style.margin = '0';
                previewContent.style.padding = '15px';
                previewContent.style.fontFamily = 'var(--mono-font)';
                previewContent.style.whiteSpace = 'pre-wrap';
                previewContent.style.fontSize = '0.9rem';
                previewContent.textContent = text; // Render as plain text
            }

            card.append(head, previewContent);
            outputs.appendChild(card);
        });
    }

    renderPreviews();
    wrapper.appendChild(outputs);
    container.appendChild(wrapper);
}
