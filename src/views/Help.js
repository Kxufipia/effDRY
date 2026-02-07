import { t, getLanguage } from '../i18n.js'

/**
 * Renders the Help / How-To view.
 * 
 * @param {HTMLElement} container - The DOM element to render content into.
 */
export function renderHelp(container) {
    const lang = getLanguage();
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '800px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '20px';
    wrapper.style.color = 'var(--text-color)';

    const h1 = document.createElement('h1');
    h1.textContent = t('help.title');
    h1.style.marginBottom = '20px';
    h1.style.borderBottom = '1px solid var(--border-color)';
    wrapper.appendChild(h1);

    const sections = [
        {
            title: t('help.sec.variables'),
            content: lang === 'de' ? `
                <p>Benutze geschweifte Klammern, um Variablen zu definieren. Diese erscheinen als Eingabefelder im Generator.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hallo {kunden_name}, vielen Dank für Ihre Bestellung!
                </code>
            ` : `
                <p>Use curly braces to define variables. They will appear as input fields in the Generator.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hello {customer_name}, thanks for your order!
                </code>
            `
        },
        {
            title: t('help.sec.defaults'),
            content: lang === 'de' ? `
                <p>Definiere einen Standardwert mit einem Doppelpunkt in der Klammer.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hallo {user:Gast}, willkommen zurück!
                </code>
                <p>Wenn das Eingabefeld leer bleibt, wird "Gast" verwendet.</p>
            ` : `
                <p>You can define a default value by adding a colon inside the braces.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    Hi {user:Guest}, welcome back!
                </code>
                <p>If you leave the input empty in the Generator, "Guest" will be used.</p>
            `
        },
        {
            title: t('help.sec.logic'),
            content: lang === 'de' ? `
                <p>Zeige oder verstecke Inhalte basierend auf einer Checkbox. Benutze <code>{#if var}...{/if}</code>.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    {#if is_vip}
                    Exklusives VIP Angebot: 20% RABATT!
                    {/if}
                </code>
                <p>Im Generator erscheint "is_vip" als <b>Checkbox</b>.</p>
            ` : `
                <p>Show or hide content based on a checkbox (Switch). Use <code>{#if var}...{/if}</code>.</p>
                <code style="background:var(--sidebar-bg); padding:5px; display:block; margin:10px 0;">
                    {#if is_vip}
                    Exclusive VIP Offer: 20% OFF!
                    {/if}
                </code>
                <p>In the Generator, "is_vip" will appear as a <b>checkbox</b>.</p>
            `
        },
        {
            title: t('help.sec.groups'),
            content: lang === 'de' ? `
                <p>Organisiere deine Vorlagen in Gruppen.</p>
                <ul>
                    <li><b>Gruppe erstellen</b>: Nutze das "+ Gruppe" Formular oben im Editor.</li>
                    <li><b>Verschieben</b>: Ziehe Vorlagen einfach per Drag & Drop in eine Gruppe.</li>
                    <li><b>Löschen</b>: Wenn eine Gruppe gelöscht wird, landen die Vorlagen unter "Ungruppiert".</li>
                </ul>
            ` : `
                <p>Organize your templates into groups.</p>
                <ul>
                    <li><b>Create Group</b>: Use the "+ Group" form at the top of the Editor list.</li>
                    <li><b>Move Templates</b>: Drag and drop templates into group boxes.</li>
                    <li><b>Delete Group</b>: Deleting a group moves its templates to the "Ungrouped" section.</li>
                </ul>
            `
        },
        {
            title: t('help.sec.richText'),
            content: lang === 'de' ? `
                <p>Schalte "Rich Text" für eine Vorlage ein, um Fettschrift, Listen, Überschriften usw. zu nutzen.</p>
            ` : `
                <p>Toggle "Rich Text" on any template to use bold, italics, headers, lists, etc.</p>
            `
        },
        {
            title: t('help.sec.topics'),
            content: lang === 'de' ? `
                <p>Organisiere Themen in Ordnern in der Seitenleiste.</p>
                <ul>
                    <li><b>Ordner erstellen</b>: Klicke auf das <b>📁+</b> Icon oben in der Seitenleiste.</li>
                    <li><b>Organisieren</b>: Ziehe Themen in einen Ordner (oder heraus).</li>
                </ul>
            ` : `
                <p>Organize topics into folders in the sidebar.</p>
                <ul>
                    <li><b>Create Folder</b>: Click the <b>📁+</b> icon in the sidebar header.</li>
                    <li><b>Organize</b>: Drag and drop topics into (or out of) folders.</li>
                </ul>
            `
        },
        {
            title: t('help.sec.data'),
            content: lang === 'de' ? `
                <p>Sichere deine Daten oder übertrage sie auf ein anderes Gerät.</p>
                <ul>
                    <li><b>Export JSON</b>: Lädt alle Themen, Vorlagen und Einstellungen als Datei herunter.</li>
                    <li><b>Import JSON</b>: Stellt Daten aus einer Datei wieder her.</li>
                </ul>
            ` : `
                <p>Backup usage data or transfer to another device.</p>
                <ul>
                    <li><b>Export JSON</b>: Downloads all topics, templates, and settings as a file.</li>
                    <li><b>Import JSON</b>: Restores data from a file.</li>
                </ul>
            `
        }
    ];

    sections.forEach(sec => {
        const div = document.createElement('div');
        div.style.marginBottom = '40px';

        const h2 = document.createElement('h2');
        h2.textContent = sec.title;
        h2.style.fontSize = '1.2rem';
        h2.style.marginBottom = '10px';
        h2.style.color = 'var(--accent-color)';

        const body = document.createElement('div');
        body.innerHTML = sec.content;
        body.style.lineHeight = '1.6';

        div.append(h2, body);
        wrapper.appendChild(div);
    });

    container.appendChild(wrapper);
}
