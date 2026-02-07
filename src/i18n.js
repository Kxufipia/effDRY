
const dictionary = {
    en: {
        // Main / Sidebar
        'app.title': 'effDRY',
        'sidebar.topics': 'TOPICS',
        'sidebar.data': 'DATA',
        'sidebar.support': 'SUPPORT',
        'sidebar.legal': 'LEGAL',
        'sidebar.newTopic': 'New Topic',
        'sidebar.newFolder': 'New Folder',
        'sidebar.export': 'Export JSON',
        'sidebar.import': 'Import JSON',
        'sidebar.help': 'Help / How-To',
        'sidebar.impressum': 'Impressum',
        'sidebar.privacy': 'Privacy Policy',
        'sidebar.confirmDeleteFolder': 'Delete this folder? Topics inside will be moved to root.',

        // Top Bar
        'header.noTopic': 'No Topic Selected',
        'header.editor': 'Editor',
        'header.generator': 'Generator',

        // Editor
        'editor.topicName': 'Topic Name',
        'editor.addTemplate': 'Add Template(s)',
        'editor.deleteTopic': 'Delete Topic',
        'editor.confirmDeleteTopic': 'Delete this topic and all its templates?',
        'editor.keywords.label': 'Available Keywords (Click to Insert):',
        'editor.keywords.refine': 'Refine Keyword Labels (for Generator)',
        'editor.keywords.newPlaceholder': 'New Keyword (no braces)',
        'editor.keywords.displayPlaceholder': 'Display Label',
        'editor.keywords.validate': 'Keyword must use letters, numbers, and underscores only.',
        'editor.group.newPlaceholder': 'New Group Name...',
        'editor.group.addBtn': '+ Group',
        'editor.group.ungrouped': 'Ungrouped',
        'editor.group.dragPlaceholder': '(Drag templates here)',
        'editor.group.deleteConfirm': 'Delete this group? Templates will move to Ungrouped.',
        'editor.template.plain': 'Switch to Plain Text',
        'editor.template.rich': 'Switch to Rich Text',
        'editor.template.delete': 'Delete Template',
        'editor.template.placeholder': 'Hello {name}...',
        'editor.template.usedKeywords': 'Used Keywords:',
        'editor.template.none': 'None',
        'editor.empty': "No templates yet. Click 'Add Template' to create one.",

        // Generator
        'generator.empty': 'No templates available for this topic.',
        'generator.reset': 'Reset Form',
        'generator.preview': 'Preview',
        'generator.copyText': 'Copy Text',
        'generator.copyHtml': 'Copy HTML',
        'generator.copied': 'Copied!',

        // Legal
        'legal.impressum.title': 'Impressum (Legal Notice)',
        'legal.privacy.title': 'Privacy Policy',

        // Help
        'help.title': 'How to Use effDRY',
        'help.sec.variables': '1. Basic Variables',
        'help.sec.defaults': '2. Defaults',
        'help.sec.logic': '3. Logic & Conditionals',
        'help.sec.groups': '4. Template Groups (Folders)',
        'help.sec.richText': '5. Rich Text Mode',
        'help.sec.topics': '6. Topic Folders (Sidebar)',
        'help.sec.data': '7. Import / Export',
        'help.sec.renaming': '8. Keyword Renaming',
    },
    de: {
        // Main / Sidebar
        'app.title': 'effDRY',
        'sidebar.topics': 'THEMEN',
        'sidebar.data': 'DATEN',
        'sidebar.support': 'HILFE',
        'sidebar.legal': 'RECHTLICHES',
        'sidebar.newTopic': 'Neues Thema',
        'sidebar.newFolder': 'Neuer Ordner',
        'sidebar.export': 'JSON Exportieren',
        'sidebar.import': 'JSON Importieren',
        'sidebar.help': 'Anleitung / Hilfe',
        'sidebar.impressum': 'Impressum',
        'sidebar.privacy': 'Datenschutzerklärung',
        'sidebar.confirmDeleteFolder': 'Diesen Ordner löschen? Themen werden in das Hauptverzeichnis verschoben.',

        // Top Bar
        'header.noTopic': 'Kein Thema ausgewählt',
        'header.editor': 'Editor',
        'header.generator': 'Generator',

        // Editor
        'editor.topicName': 'Themenname',
        'editor.addTemplate': 'Vorlage(n) hinzufügen',
        'editor.deleteTopic': 'Thema löschen',
        'editor.confirmDeleteTopic': 'Dieses Thema und alle Vorlagen löschen?',
        'editor.keywords.label': 'Verfügbare Schlüsselwörter (Klicken zum Einfügen):',
        'editor.keywords.refine': 'Schlüsselwort-Beschriftungen (für Generator)',
        'editor.keywords.newPlaceholder': 'Neues Keyword (ohne Klammern)',
        'editor.keywords.displayPlaceholder': 'Anzeigename',
        'editor.keywords.validate': 'Schlüsselwörter dürfen nur Buchstaben, Zahlen und Unterstriche enthalten.',
        'editor.group.newPlaceholder': 'Neuer Gruppenname...',
        'editor.group.addBtn': '+ Gruppe',
        'editor.group.ungrouped': 'Ungruppiert',
        'editor.group.dragPlaceholder': '(Vorlagen hierher ziehen)',
        'editor.group.deleteConfirm': 'Diese Gruppe löschen? Vorlagen werden nach "Ungruppiert" verschoben.',
        'editor.template.plain': 'Zu Reintext wechseln',
        'editor.template.rich': 'Zu Rich Text wechseln',
        'editor.template.delete': 'Vorlage löschen',
        'editor.template.placeholder': 'Hallo {name}...',
        'editor.template.usedKeywords': 'Verwendete Keywords:',
        'editor.template.none': 'Keine',
        'editor.empty': "Noch keine Vorlagen. Klicke auf 'Vorlage hinzufügen'.",

        // Generator
        'generator.empty': 'Keine Vorlagen für dieses Thema verfügbar.',
        'generator.reset': 'Formular zurücksetzen',
        'generator.preview': 'Vorschau',
        'generator.copyText': 'Text kopieren',
        'generator.copyHtml': 'HTML kopieren',
        'generator.copied': 'Kopiert!',

        // Legal
        'legal.impressum.title': 'Impressum',
        'legal.privacy.title': 'Datenschutzerklärung',

        // Help
        'help.title': 'Anleitung für effDRY',
        'help.sec.variables': '1. Variablen & Platzhalter',
        'help.sec.defaults': '2. Standardwerte',
        'help.sec.logic': '3. Logik & Bedingungen',
        'help.sec.groups': '4. Vorlagen-Gruppen',
        'help.sec.richText': '5. Rich Text Modus',
        'help.sec.topics': '6. Themen-Ordner',
        'help.sec.data': '7. Import / Export',
    }
};

let currentLang = localStorage.getItem('effdry_lang') || 'en';
if (!dictionary[currentLang]) currentLang = 'en';
const listeners = [];

/**
 * Get translation for a key.
 * @param {string} key 
 * @returns {string} Translated string or key if missing.
 */
export function t(key) {
    return dictionary[currentLang][key] || key;
}

/**
 * Set the current language.
 * @param {'en'|'de'} lang 
 */
export function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'de') return;
    currentLang = lang;
    localStorage.setItem('effdry_lang', lang);
    notify();
}

/**
 * Get current language.
 * @returns {'en'|'de'}
 */
export function getLanguage() {
    return currentLang;
}

export function subscribeLanguage(cb) {
    listeners.push(cb);
    return () => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
    }
}

function notify() {
    listeners.forEach(cb => cb(currentLang));
}
