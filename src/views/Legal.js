export function renderImpressum(container) {
    container.innerHTML = `
    <div class="legal-page">
      <h1>Impressum</h1>
      <p>Angaben gemäß § 5 TMG</p>
      <p>
        <strong>Max Mustermann</strong><br>
        Musterstraße 1<br>
        12345 Musterstadt
      </p>
      <p>
        <strong>Kontakt:</strong><br>
        Telefon: +49 (0) 123 44 55 66<br>
        E-Mail: muster@example.com
      </p>
    </div>
  `;
}

export function renderPrivacy(container) {
    container.innerHTML = `
    <div class="legal-page">
      <h1>Datenschutzerklärung</h1>
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
    </div>
  `;
}
