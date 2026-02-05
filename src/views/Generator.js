import { store } from '../store.js'
import { extractKeywords, interpolate } from '../utils.js'

// We keep a small local cache of values so they don't vanish when switching tabs
// In a real app, this might go in the store or a context
const valuesCache = {};

export function renderGenerator(container, topic) {
    // Ensure we have an object for this topic
    if (!valuesCache[topic.id]) valuesCache[topic.id] = {};
    const values = valuesCache[topic.id];

    const wrapper = document.createElement('div');

    // 1. INPUT FORM
    const keywords = new Set();
    topic.templates.forEach(t => {
        extractKeywords(t.content).forEach(k => keywords.add(k));
    });

    if (keywords.size > 0) {
        const headerNodes = document.createElement('div');
        headerNodes.innerHTML = '<h3 style="font-size:1rem; margin-bottom:15px; text-transform:uppercase; opacity:0.7;">1. Enter Keywords</h3>';
        wrapper.appendChild(headerNodes);

        const form = document.createElement('div');
        form.className = 'grid mb-4';
        form.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';

        keywords.forEach(k => {
            const field = document.createElement('div');

            const label = document.createElement('label');
            const mappings = topic.keywordMappings || {};
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
            input.placeholder = `Value for ${k}...`;
            input.oninput = (e) => {
                values[k] = e.target.value;
                renderPreviews(); // Update previews in real-time
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

    // 2. OUTPUT PREVIEWS
    const previewHeader = document.createElement('h3');
    previewHeader.innerHTML = '2. Generated Results';
    previewHeader.style.fontSize = '1rem';
    previewHeader.style.marginBottom = '15px';
    previewHeader.style.textTransform = 'uppercase';
    previewHeader.style.opacity = '0.7';
    wrapper.appendChild(previewHeader);

    const outputs = document.createElement('div');
    outputs.className = 'grid';
    outputs.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))'; // Wider than inputs for readability

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

            const copyBtn = document.createElement('button');
            copyBtn.className = 'icon-btn';
            copyBtn.innerHTML = '📋 <span style="font-size:0.8rem">Copy</span>';

            const text = interpolate(t.content, values);

            copyBtn.onclick = () => {
                // Copy text strip html if rich? No, usually copy formatted. 
                // For now, simpler to use clipboard API which naturally handles text. 
                // If rich text, maybe copy ID.
                // Let's copy plain text representation for now to be safe, or html source?
                // User usually wants the RESULT. 
                // If I put HTML into clipboard as 'text/html', it pastes formatted.

                if (t.isRichText) {
                    const blob = new Blob([text], { type: 'text/html' });
                    const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([text], { type: 'text/plain' }) }); // Fallback
                    // Actually, copying 'text' (which is HTML string) as 'text/plain' will paste code.
                    // We likely want to copy the *rendered* result.
                    // Simplest: Write the text (which is HTML or Plain) to a temporary element, select, and execCommand('copy').
                    // OR use Clipboard API.
                    // Let's stick to text for now.
                    navigator.clipboard.writeText(text);
                } else {
                    navigator.clipboard.writeText(text);
                }

                copyBtn.innerHTML = '✅ <span style="font-size:0.8rem">Copied</span>';
                setTimeout(() => copyBtn.innerHTML = '📋 <span style="font-size:0.8rem">Copy</span>', 1000);
            };

            head.appendChild(copyBtn);

            let previewContent;
            if (t.isRichText) {
                previewContent = document.createElement('div');
                previewContent.style.padding = '15px';
                previewContent.innerHTML = text; // Render HTML
            } else {
                previewContent = document.createElement('pre');
                previewContent.style.margin = '0';
                previewContent.style.padding = '15px';
                previewContent.style.fontFamily = 'var(--mono-font)';
                previewContent.style.whiteSpace = 'pre-wrap';
                previewContent.style.fontSize = '0.9rem';
                previewContent.textContent = text;
            }

            card.append(head, previewContent);
            outputs.appendChild(card);
        });
    }

    renderPreviews();
    wrapper.appendChild(outputs);
    container.appendChild(wrapper);
}
