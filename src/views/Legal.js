import { t, getLanguage } from '../i18n.js'

/**
 * Renders the Impressum (Imprint) page.
 * @param {HTMLElement} container - The DOM element to render content into.
 */
export function renderImpressum(container) {
  const lang = getLanguage();
  container.innerHTML = `
    <div class="legal-page">
      <h1>${t('legal.impressum.title')}</h1>
      <p>${lang === 'de' ? 'Angaben gemäß § 5 TMG' : 'Information according to § 5 TMG'}</p>
      <p>
        <strong>Max Mustermann</strong><br>
        Musterstraße 1<br>
        12345 Musterstadt
      </p>
      <p>
        <strong>${lang === 'de' ? 'Kontakt' : 'Contact'}:</strong><br>
        Telefon: +49 (0) 123 44 55 66<br>
        E-Mail: muster@example.com
      </p>
    </div>
  `;
}

/**
 * Renders the Privacy Policy page.
 * @param {HTMLElement} container - The DOM element to render content into.
 */
export function renderPrivacy(container) {
  const lang = getLanguage();
  const content = lang === 'de' ? `
      <h2>1. Datenschutz auf einen Blick</h2>
      <h3>Allgemeine Hinweise</h3>
      <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
      
      <h3>Datenerfassung auf dieser Website</h3>
      <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
      <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
      
      <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
      <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
      <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).</p>
      
      <h3>Lokale Speicherung & Datenverarbeitung</h3>
      <p>Diese Anwendung speichert Daten (z.B. Vorlagen, Schlagwörter, Umbenennungen) ausschließlich lokal in Ihrem Browser (Local Storage). Es werden keine Daten an externe Server übertragen.</p>
      
      <h3>Import & Export Funktionen</h3>
      <p>Die Anwendung bietet Funktionen zum Exportieren und Importieren von Daten (JSON-Dateien).</p>
      <ul>
        <li><strong>Export:</strong> Die Daten werden lokal in Ihrem Browser zu einer Datei zusammengefasst, die Sie herunterladen können.</li>
        <li><strong>Import:</strong> Wenn Sie eine Datei importieren, wird diese ausschließlich lokal in Ihrem Browser verarbeitet, um die Anwendungsdaten wiederherzustellen. Die Datei wird nicht hochgeladen.</li>
      </ul>
  ` : `
      <h2>1. Data Protection at a Glance</h2>
      <h3>General Notes</h3>
      <p>The following notes provide a simple overview of what happens to your personal data when you visit this website.</p>
      
      <h3>Data Collection on this Website</h3>
      <p><strong>Who is responsible for date collection on this website?</strong></p>
      <p>The data processing on this website is carried out by the website operator. You can find their contact details in the imprint of this website.</p>
      
      <h3>Local Storage & Data Processing</h3>
      <p>This application stores data (e.g. templates, keywords, renames) exclusively locally in your browser (Local Storage). No data is transmitted to external servers.</p>
      
      <h3>Import & Export Functions</h3>
      <p>The application offers functions for exporting and importing data (JSON files).</p>
      <ul>
        <li><strong>Export:</strong> The data is summarized locally in your browser into a file that you can download.</li>
        <li><strong>Import:</strong> When you import a file, it is processed exclusively locally in your browser to restore application data. The file is not uploaded.</li>
      </ul>
  `;

  container.innerHTML = `
    <div class="legal-page">
      <h1>${t('legal.privacy.title')}</h1>
      ${content}
    </div>
  `;
}
