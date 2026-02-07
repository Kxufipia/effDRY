import { store } from '../store.js'
import { extractKeywords } from '../utils.js'

/**
 * Renders the Editor view for a specific topic.
 * Allows managing the topic name, keywords, and templates.
 * 
 * @param {HTMLElement} container - The DOM element to render content into.
 * @param {Object} topic - The topic object to edit.
 */
export function renderEditor(container, topic) {
    let lastFocusedTextarea = null;

    // =========================================
    // 1. TOPIC NAME EDITOR
    // =========================================
    const nameContainer = document.createElement('div');
    nameContainer.className = 'mb-4';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Topic Name';
    nameLabel.style.display = 'block';
    nameLabel.style.fontSize = '0.8rem';
    nameLabel.style.marginBottom = '5px';
    nameLabel.style.opacity = '0.7';

    const nameInput = document.createElement('input');
    nameInput.value = topic.name;
    nameInput.style.fontSize = '1.2rem';
    nameInput.style.fontWeight = 'bold';
    nameInput.style.padding = '10px';
    nameInput.onchange = (e) => {
        store.updateTopic(topic.id, e.target.value);
    };

    nameContainer.append(nameLabel, nameInput);
    container.appendChild(nameContainer);

    // =========================================
    // 2. TEMPLATE CONTROLS (Add/Delete Loop)
    // =========================================
    const controls = document.createElement('div');
    controls.className = 'mb-4 flex-row';
    controls.style.justifyContent = 'space-between';
    controls.style.background = 'var(--sidebar-bg)';
    controls.style.padding = '15px';
    controls.style.borderRadius = '4px';
    controls.style.border = '1px solid var(--border-color)';

    const bulkGroup = document.createElement('div');
    bulkGroup.className = 'flex-row';

    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.value = '1';
    countInput.min = '1';
    countInput.style.width = '60px';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Template(s)';
    addBtn.onclick = () => {
        const count = parseInt(countInput.value) || 1;
        for (let i = 0; i < count; i++) {
            store.addTemplate(topic.id, '');
        }
    };

    bulkGroup.append(countInput, addBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'secondary';
    deleteBtn.style.color = '#f48771';
    deleteBtn.textContent = 'Delete Topic';
    deleteBtn.onclick = () => {
        if (confirm('Delete this topic and all its templates?')) store.deleteTopic(topic.id);
    };

    controls.append(bulkGroup, deleteBtn);
    container.appendChild(controls);

    // =========================================
    // 3. KEYWORD COLLECTION & TOOLBAR PREPARATION
    // =========================================

    // Collect all unique keywords from all templates + existing mappings
    const allKeywords = new Set();
    topic.templates.forEach(t => {
        extractKeywords(t.content).forEach(k => allKeywords.add(k));
    });
    if (topic.keywordMappings) {
        Object.keys(topic.keywordMappings).forEach(k => allKeywords.add(k));
    }

    // Shared Keyword Toolbar Element (Created once, moved around or cloned as needed)
    // Note: In this architecture, we create it but append it dynamically to focused editors
    let kwToolbar = null;
    if (allKeywords.size > 0) {
        kwToolbar = document.createElement('div');
        kwToolbar.className = 'mb-4';
        kwToolbar.style.padding = '10px';
        kwToolbar.style.background = 'rgba(0, 122, 204, 0.1)';
        kwToolbar.style.border = '1px solid var(--accent-color)';
        kwToolbar.style.borderRadius = '4px';

        // Prevent focus loss when clicking toolbar background/gaps
        kwToolbar.onmousedown = (e) => e.preventDefault();

        const kwLabel = document.createElement('div');
        kwLabel.textContent = 'Available Keywords (Click to Insert):';
        kwLabel.style.fontSize = '0.8rem';
        kwLabel.style.marginBottom = '8px';
        kwLabel.style.opacity = '0.8';
        kwToolbar.appendChild(kwLabel);

        const kwList = document.createElement('div');
        kwList.style.display = 'flex';
        kwList.style.flexWrap = 'wrap';
        kwList.style.gap = '8px';

        allKeywords.forEach(k => {
            const badge = document.createElement('div');
            badge.className = 'keyword-badge';
            badge.textContent = `{${k}}`;
            badge.style.cursor = 'pointer';
            badge.style.display = 'inline-block';
            badge.style.alignItems = 'center';
            badge.style.justifyContent = 'center';
            badge.style.padding = '2px 6px';
            badge.style.fontSize = '0.9rem';
            badge.tabIndex = -1; // Not key focusable
            badge.style.background = 'var(--input-bg)';
            badge.style.color = '#ce9178';
            badge.style.border = '1px solid var(--border-color)';
            badge.title = `Insert {${k}}`;

            // Handle Keyword Insertion
            badge.onmousedown = (e) => {
                e.preventDefault(); // Prevent focus loss from editor
                e.stopPropagation(); // Don't bubble to container

                if (lastFocusedTextarea) {
                    const text = `{${k}}`;

                    if (lastFocusedTextarea.contentEditable === 'true') {
                        // WYSIWYG Insert
                        lastFocusedTextarea.focus(); // Ensure focus
                        document.execCommand('insertText', false, text);
                    } else {
                        // Textarea Insert
                        const start = lastFocusedTextarea.selectionStart;
                        const end = lastFocusedTextarea.selectionEnd;
                        const val = lastFocusedTextarea.value;

                        lastFocusedTextarea.value = val.substring(0, start) + text + val.substring(end);
                        lastFocusedTextarea.selectionStart = lastFocusedTextarea.selectionEnd = start + text.length;
                        lastFocusedTextarea.focus();
                        lastFocusedTextarea.dispatchEvent(new Event('change'));
                    }
                } else {
                    alert('Please click inside a template editor first!');
                }
            };
            kwList.appendChild(badge);
        });

        kwToolbar.appendChild(kwList);

        // =========================================
        // 4. KEYWORD RENAMING & SORTING (Drag-and-Drop)
        // =========================================
        const renameSection = document.createElement('div');
        renameSection.className = 'mb-4';
        renameSection.style.padding = '10px';
        renameSection.style.background = 'var(--sidebar-bg)';
        renameSection.style.border = '1px solid var(--border-color)';
        renameSection.style.borderRadius = '4px';

        const renameHeader = document.createElement('div');
        renameHeader.textContent = 'Refine Keyword Labels (for Generator)';
        renameHeader.style.fontSize = '0.8rem';
        renameHeader.style.fontWeight = 'bold';
        renameHeader.style.marginBottom = '10px';
        renameHeader.style.opacity = '0.7';
        renameSection.appendChild(renameHeader);

        // Add Manual Keyword Form
        const addKwContainer = document.createElement('div');
        addKwContainer.className = 'flex-row mb-2';
        addKwContainer.style.gap = '10px';

        const addKwInput = document.createElement('input');
        addKwInput.placeholder = "New Keyword (no braces)";
        addKwInput.style.fontSize = '0.8rem';

        const addKwBtn = document.createElement('button');
        addKwBtn.textContent = '+';
        addKwBtn.style.padding = '2px 8px';
        addKwBtn.onclick = () => {
            const raw = addKwInput.value.trim();
            if (!raw) return;
            // Basic validation: alphanumeric + underscore
            if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
                alert('Keyword must use letters, numbers, and underscores only.');
                return;
            }
            store.updateKeywordMapping(topic.id, raw, raw); // Initialize with same name
            addKwInput.value = '';
        };

        addKwContainer.append(addKwInput, addKwBtn);
        renameSection.appendChild(addKwContainer);

        const renameGrid = document.createElement('div');
        renameGrid.className = 'grid';
        renameGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        renameGrid.style.gap = '10px';

        // Sort keywords for display in the grid
        const sortedKeywords = Array.from(allKeywords);
        if (topic.keywordOrder && topic.keywordOrder.length > 0) {
            sortedKeywords.sort((a, b) => {
                const idxA = topic.keywordOrder.indexOf(a);
                const idxB = topic.keywordOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else {
            sortedKeywords.sort();
        }

        // Render each keyword block with Drag-and-Drop capability
        let draggedKeyword = null;

        sortedKeywords.forEach(k => {
            const field = document.createElement('div');
            field.draggable = true; // Enable Drag
            field.dataset.keyword = k;
            field.style.cursor = 'grab';
            field.style.border = '1px solid transparent';

            // --- Drag Start ---
            field.ondragstart = (e) => {
                draggedKeyword = k;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', k); // Required for some browsers
                field.style.opacity = '0.5';
                field.classList.add('dragging');
            };

            // --- Drag End ---
            field.ondragend = () => {
                field.style.opacity = '1';
                field.classList.remove('dragging');
                draggedKeyword = null;
                // Cleanup visual indicators
                Array.from(renameGrid.children).forEach(child => {
                    child.style.border = '1px solid transparent';
                });
            };

            // --- Drag Over (Allow Drop) ---
            field.ondragover = (e) => {
                e.preventDefault(); // Essential to allow dropping
                e.dataTransfer.dropEffect = 'move';
                field.style.border = '1px dashed var(--accent-color)';
            };

            field.ondragleave = (e) => {
                field.style.border = '1px solid transparent';
            };

            // --- Drop Action ---
            field.ondrop = (e) => {
                e.preventDefault();
                field.style.border = '1px solid transparent';

                const sourceKw = draggedKeyword || e.dataTransfer.getData('text/plain');
                if (!sourceKw || sourceKw === k) return;

                // Reorder logic
                let newOrder = [...sortedKeywords];
                const fromIndex = newOrder.indexOf(sourceKw);
                const toIndex = newOrder.indexOf(k);

                if (fromIndex !== -1 && toIndex !== -1) {
                    newOrder.splice(fromIndex, 1);
                    newOrder.splice(toIndex, 0, sourceKw);

                    store.updateKeywordOrder(topic.id, newOrder);
                    renderEditor(container, topic); // Full Re-render to reflect new order
                }
            };

            const label = document.createElement('label');
            label.textContent = `{${k}}`;
            label.style.display = 'block';
            label.style.fontSize = '0.75rem';
            label.style.color = '#ce9178';
            label.style.marginBottom = '2px';
            label.style.pointerEvents = 'none'; // Prevent interfering with drag

            const input = document.createElement('input');
            input.placeholder = "Display Label";
            const mappings = topic.keywordMappings || {};
            input.value = mappings[k] || '';
            input.style.fontSize = '0.85rem';
            input.style.padding = '4px 8px';
            // Stop drag propagation when typing
            input.onmousedown = (e) => e.stopPropagation();
            input.onchange = (e) => {
                store.updateKeywordMapping(topic.id, k, e.target.value);
            };

            field.append(label, input);
            renameGrid.appendChild(field);
        });

        renameSection.appendChild(renameGrid);
        container.appendChild(renameSection);
    }

    // =========================================
    // 5. TEMPLATE LIST
    // =========================================
    const list = document.createElement('div');

    /**
     * Helper to create a WYSIWYG toolbar button
     */
    function createToolbarBtn(label, command, value = null) {
        const btn = document.createElement('button');
        btn.className = 'wysiwyg-btn';
        btn.textContent = label;
        btn.onmousedown = (e) => {
            e.preventDefault(); // Prevent losing focus from editor
            document.execCommand(command, false, value);
        };
        return btn;
    }

    topic.templates.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'template-card';

        const head = document.createElement('div');
        head.className = 'template-header';

        // --- Template Actions ---
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex-row';
        actionsContainer.style.width = '100%';
        actionsContainer.style.justifyContent = 'flex-end';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'secondary';
        toggleBtn.style.fontSize = '0.8rem';
        toggleBtn.textContent = tpl.isRichText ? 'Switch to Plain Text' : 'Switch to Rich Text';
        toggleBtn.onclick = () => {
            store.updateTemplate(topic.id, tpl.id, { isRichText: !tpl.isRichText });
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn';
        delBtn.textContent = '🗑️';
        delBtn.title = "Delete Template";
        delBtn.onclick = () => store.deleteTemplate(topic.id, tpl.id);

        actionsContainer.append(toggleBtn, delBtn);
        head.append(actionsContainer);
        card.appendChild(head);

        // Mount point for Dynamic Keyword Toolbar (injected when editor focused)
        const toolbarMount = document.createElement('div');
        toolbarMount.className = 'keyword-toolbar-area';
        card.appendChild(toolbarMount);

        // --- Editor Body ---
        if (tpl.isRichText) {
            // RICH TEXT (ContentEditable)
            const container = document.createElement('div');
            container.className = 'wysiwyg-container';

            const toolbar = document.createElement('div');
            toolbar.className = 'wysiwyg-toolbar';
            toolbar.append(
                createToolbarBtn('B', 'bold'),
                createToolbarBtn('I', 'italic'),
                createToolbarBtn('U', 'underline'),
                createToolbarBtn('H1', 'formatBlock', 'H1'),
                createToolbarBtn('H2', 'formatBlock', 'H2'),
                createToolbarBtn('List', 'insertUnorderedList')
            );

            const editor = document.createElement('div');
            editor.className = 'wysiwyg-content';
            editor.contentEditable = true;
            editor.innerHTML = tpl.content;

            // Sync changes to store
            editor.onblur = (e) => {
                store.updateTemplate(topic.id, tpl.id, { content: editor.innerHTML }, false); // Silent Update

                // If hovering toolbar, do not hide it
                if (kwToolbar && kwToolbar.matches(':hover')) return;

                const newFocus = e.relatedTarget;
                if (kwToolbar && (kwToolbar.contains(newFocus) || kwToolbar === newFocus)) {
                    return;
                }

                // Delayed check to see where focus went
                setTimeout(() => {
                    if (document.activeElement !== editor &&
                        !kwToolbar.contains(document.activeElement) &&
                        !kwToolbar.matches(':hover')) {
                        if (kwToolbar) kwToolbar.remove();
                    }
                }, 150);
            };

            // On Focus: Attach shared keyword toolbar
            editor.onfocus = () => {
                lastFocusedTextarea = editor;
                if (kwToolbar) {
                    toolbarMount.appendChild(kwToolbar);
                }
            };

            container.append(toolbar, editor);
            card.appendChild(container);

        } else {
            // PLAIN TEXT (Textarea)
            const textarea = document.createElement('textarea');
            textarea.className = 'editor-textarea';
            textarea.value = tpl.content;
            textarea.rows = 4;
            textarea.placeholder = "Hello {name}..."
            textarea.style.border = 'none';
            textarea.style.display = 'block';
            textarea.style.marginTop = '0';

            textarea.onfocus = () => {
                lastFocusedTextarea = textarea;
                if (kwToolbar) {
                    toolbarMount.appendChild(kwToolbar);
                }
            };

            textarea.onblur = (e) => {
                store.updateTemplate(topic.id, tpl.id, { content: e.target.value }, false); // Silent

                if (kwToolbar && kwToolbar.matches(':hover')) return;

                const newFocus = e.relatedTarget;
                if (kwToolbar && (kwToolbar.contains(newFocus) || kwToolbar === newFocus)) {
                    return;
                }

                setTimeout(() => {
                    const active = document.activeElement;
                    if (active !== textarea &&
                        !kwToolbar.contains(active) &&
                        !kwToolbar.matches(':hover')) {
                        if (kwToolbar) kwToolbar.remove();
                    }
                }, 150);
            };

            textarea.onchange = (e) => store.updateTemplate(topic.id, tpl.id, { content: e.target.value }, false);
            card.appendChild(textarea);
        }

        // --- Used Keywords Indicator ---
        const footer = document.createElement('div');
        footer.style.marginTop = '10px';
        footer.style.paddingTop = '10px';
        footer.style.borderTop = '1px dashed var(--border-color)';

        const usedTitle = document.createElement('div');
        usedTitle.textContent = 'Used Keywords:';
        usedTitle.style.fontSize = '0.7rem';
        usedTitle.style.opacity = '0.6';
        usedTitle.style.marginBottom = '5px';
        footer.appendChild(usedTitle);

        const kwContainer = document.createElement('div');
        kwContainer.style.display = 'flex';
        kwContainer.style.alignItems = 'center';
        kwContainer.style.flexWrap = 'wrap';
        kwContainer.style.gap = '5px';

        const keywords = extractKeywords(tpl.content);
        if (keywords.length > 0) {
            keywords.forEach(k => {
                const badge = document.createElement('span');
                badge.className = 'keyword-badge';
                badge.textContent = `{${k}}`;
                badge.style.fontSize = '0.75rem';
                badge.style.padding = '2px 6px';
                kwContainer.appendChild(badge);
            });
        } else {
            const empty = document.createElement('span');
            empty.textContent = 'None';
            empty.style.opacity = '0.5';
            empty.style.fontSize = '0.75rem';
            kwContainer.appendChild(empty);
        }
        footer.appendChild(kwContainer);
        card.appendChild(footer);

        list.appendChild(card);
    });

    container.appendChild(list);
}
