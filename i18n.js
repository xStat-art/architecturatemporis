/**
 * i18n.js — shared across ATRC internal-tools pages (field-workspace.html,
 * field.html, and any future ones).
 *
 * HOW IT WORKS
 * - Every translatable element gets data-i18n="key" in the HTML.
 * - On load, this script picks a language:
 *     1. If the person has manually switched before, use that
 *        (saved in localStorage under "atrc-lang").
 *     2. Otherwise, auto-detect from the phone/browser (navigator.language)
 *        — if it starts with "sr", default to Serbian, else English.
 * - It then walks every [data-i18n] element and swaps its text.
 * - A small EN/SR toggle (button with id="langToggle", added per-page)
 *   lets anyone override the auto-detected choice; the override is
 *   remembered for next time.
 *
 * WHAT STAYS ENGLISH ALWAYS, PER SERGEI: data values, tables, charts, and
 * tool proper names (Field Launcher, Zone Editor, GPS Locator, Passport
 * Registry, TIA Viewer) — those never get a data-i18n attribute at all,
 * so this script never touches them regardless of language.
 *
 * ADDING A THIRD LANGUAGE LATER: add a new column to TRANSLATIONS below
 * (e.g. "ru": "..."), add it to LANGS, and add a button for it wherever
 * the toggle lives. No other changes needed — every page sharing this
 * file picks it up automatically.
 */

const LANGS = ['en', 'sr'];

const TRANSLATIONS = {
  // ── nav ──
  'nav.problem':      { en: 'Problem',     sr: 'Problem' },
  'nav.methodology':  { en: 'Methodology', sr: 'Metodologija' },
  'nav.acap':         { en: 'ACAP',        sr: 'ACAP' },
  'nav.research':     { en: 'Research',    sr: 'Istraživanje' },
  'nav.atu':          { en: 'ATU',         sr: 'ATU' },
  'nav.roadmap':      { en: 'Roadmap',     sr: 'Plan razvoja' },
  'nav.contact':      { en: 'Contact',     sr: 'Kontakt' },
  'nav.explore':      { en: 'Explore',     sr: 'Istraži' },
  'nav.fieldWorkspace': { en: 'Field Workspace', sr: 'Terenski alati' },

  // ── mobile menu ──
  'mnav.home':        { en: 'Home', sr: 'Početna' },
  'mnav.explore':     { en: 'Explore — public data', sr: 'Istraži — javni podaci' },
  'mnav.fieldLauncher': { en: 'Field Launcher', sr: 'Field Launcher' },
  'mnav.zoneEditor':  { en: 'Zone Editor', sr: 'Zone Editor' },
  'mnav.gpsLocator':  { en: 'GPS Locator', sr: 'GPS Locator' },
  'mnav.registry':    { en: 'Passport Registry', sr: 'Passport Registry' },
  'mnav.tia':         { en: 'TIA Viewer', sr: 'TIA Viewer' },

  // ── hero ──
  'hero.eyebrow': { en: 'Architectura Temporis Research Centre · Internal tools', sr: 'Architectura Temporis Research Centre · Interni alati' },
  'hero.h1':      { en: 'Field Workspace', sr: 'Terenski alati' },
  'hero.p':       {
    en: 'Tools for measuring, mapping, and managing Chronity Zones in the field. Built for researchers collecting AT v5.0 data — GPS capture, zone drawing, live spectral mapping, and the full passport registry.',
    sr: 'Alati za merenje, mapiranje i upravljanje Hronitetnim zonama na terenu. Napravljeno za istraživače koji prikupljaju AT v5.0 podatke — GPS snimanje, crtanje zona, uživo spektralno mapiranje i kompletan registar pasoša.',
  },

  // ── section headers ──
  'sec.fieldTools': { en: 'Field Tools', sr: 'Terenski alati' },
  'sec.publicData': { en: 'Public Data', sr: 'Javni podaci' },

  // ── card: Field Launcher ──
  'card.fieldLauncher.status': { en: 'v2 · Live', sr: 'v2 · Aktivno' },
  'card.fieldLauncher.desc': {
    en: "Live GPS map for fieldwork. Highlights the Chronity Zone you're standing in, flags nearby dominants within ~10m, and tells you whether you're auditing an existing object or registering a new one.",
    sr: 'GPS mapa uživo za terenski rad. Ističe Hronitetnu zonu u kojoj se nalazite, označava obližnje dominante u krugu od ~10m i javlja da li proveravate postojeći objekat ili registrujete novi.',
  },
  'card.fieldLauncher.open': { en: 'Open Field Launcher', sr: 'Otvori Field Launcher' },

  // ── card: Zone Editor ──
  'card.zoneEditor.status': { en: 'v2 · Live', sr: 'v2 · Aktivno' },
  'card.zoneEditor.desc': {
    en: 'Draw Chronity Zone contours directly on the map by physical boundaries — walls, roads, coastline. Built into the Spectral CI Map: open it, click "✎ Edit Zones" in the top right. Vertices snap to real OSM streets/walls automatically and save straight to the ZONES sheet.',
    sr: 'Crtajte konture Hronitetnih zona direktno na mapi po fizičkim granicama — zidovi, putevi, obala. Ugrađeno u Spectral CI Map: otvorite je, kliknite "✎ Edit Zones" gore desno. Tačke se automatski uklapaju u prave OSM ulice/zidove i čuvaju direktno u ZONES tabelu.',
  },
  'card.zoneEditor.open': { en: 'Open Spectral CI Map → Edit Zones', sr: 'Otvori Spectral CI Map → Edit Zones' },

  // ── card: GPS Locator ──
  'card.gpsLocator.status': { en: 'v1 · Live', sr: 'v1 · Aktivno' },
  'card.gpsLocator.desc': {
    en: 'Simple GPS readout for the field — auto-updates as you move, with quick links to the field form and the Spectral CI Map.',
    sr: 'Jednostavan GPS prikaz za teren — automatski se ažurira dok se krećete, sa brzim linkovima ka terenskom formularu i Spectral CI Map.',
  },
  'card.gpsLocator.open': { en: 'Open GPS Locator', sr: 'Otvori GPS Locator' },

  // ── card: Passport Registry ──
  'card.registry.status': { en: 'Live', sr: 'Aktivno' },
  'card.registry.desc': {
    en: 'Full catalog of Chrono-Passports — filter by country, city, CI category and zone, search by name or architect, click through to any passport. The working lookup table behind every field session.',
    sr: 'Kompletan katalog Hrono-pasoša — filtrirajte po državi, gradu, CI kategoriji i zoni, pretražujte po imenu ili arhitekti, otvorite bilo koji pasoš. Radna tabela iza svake terenske sesije.',
  },
  'card.registry.open': { en: 'Open Registry', sr: 'Otvori Registry' },

  // ── card: TIA ──
  'card.tia.status': { en: 'v1 · Live', sr: 'v1 · Aktivno' },
  'card.tia.desc': {
    en: "Shows how one flagged outlier — an object whose chronity falls well below the zone's own norm — pulls the zone's overall reading down. Current state vs. a hypothetical without it, side by side.",
    sr: 'Prikazuje kako jedan označen izuzetak — objekat čiji je hronitet znatno ispod norme zone — snižava ukupnu vrednost zone. Trenutno stanje naspram hipotetičkog bez njega, jedno pored drugog.',
  },
  'card.tia.open': { en: 'Open TIA Viewer', sr: 'Otvori TIA Viewer' },

  // ── card: Explore ──
  'card.explore.status': { en: 'Live', sr: 'Aktivno' },
  'card.explore.desc': {
    en: 'Public data portal — live statistics, full spectral CI map, and a searchable table of every measured object. Auto-refreshes every 60 seconds.',
    sr: 'Portal javnih podataka — statistika uživo, kompletna spektralna CI mapa i pretraživa tabela svih izmerenih objekata. Automatski se osvežava svakih 60 sekundi.',
  },
  'card.explore.open': { en: 'Open Explore', sr: 'Otvori Explore' },

  // ── card: Spectral CI Map ──
  'card.ciMap.status': { en: 'v2 · IDW', sr: 'v2 · IDW' },
  'card.ciMap.desc': {
    en: 'Standalone spectral visualization — CI mapped to visible wavelength, with IDW gradient fill across zone contours.',
    sr: 'Samostalna spektralna vizuelizacija — CI preslikan na vidljivu talasnu dužinu, sa IDW gradijentom preko kontura zona.',
  },
  'card.ciMap.open': { en: 'Open CI Map', sr: 'Otvori CI Map' },

  // ── card: Field Data Form ──
  'card.form.status': { en: 'Form', sr: 'Formular' },
  'card.form.desc': {
    en: '22-question Google Form for recording field measurements. Submissions feed the Apps Script pipeline and update the registry automatically.',
    sr: 'Google formular sa 22 pitanja za beleženje terenskih merenja. Prijave automatski pokreću Apps Script i ažuriraju registar.',
  },
  'card.form.open': { en: 'Open Form', sr: 'Otvori formular' },

  // ── note ──
  'note.body': {
    en: 'this hub is the central entry point for the field toolkit while the number of Chronity Zones stays small enough to manage manually. As the registry scales, consider moving this into the planned PWA (<code>atrc-field</code>) as the primary field interface.',
    sr: 'ova stranica je centralna tačka pristupa terenskim alatima dok je broj Hronitetnih zona dovoljno mali da se njima ručno upravlja. Kako registar bude rastao, razmisliti o prelasku na planiranu PWA aplikaciju (<code>atrc-field</code>) kao primarni terenski interfejs.',
  },
  'note.label': { en: 'Internal note:', sr: 'Interna napomena:' },

  // ── footer ──
  'footer.org': { en: 'Architectura Temporis Research Centre (ATRC) · Herceg Novi, Montenegro · Est. 2024', sr: 'Architectura Temporis Research Centre (ATRC) · Herceg Novi, Crna Gora · Osnovano 2024' },
  'footer.motto': { en: 'Understanding before change', sr: 'Razumevanje pre promene' },

  // ── language toggle itself ──
  'lang.toggle.en': { en: 'EN', sr: 'EN' },
  'lang.toggle.sr': { en: 'SR', sr: 'SR' },

  // ── tia.html: explanatory prose around the chart (the chart itself and
  // its own labels stay English always — see chat) ──
  'tia.nav.back':    { en: '\u2190 Field Workspace', sr: '\u2190 Terenski alati' },
  'tia.eyebrow':     { en: 'Architectura Temporis Research Centre · Field Workspace', sr: 'Architectura Temporis Research Centre · Terenski alati' },
  'tia.hero.p': {
    en: "Shows how one flagged outlier — an object whose chronity falls well below the zone's own norm — pulls the zone's overall reading down. Current state vs. a hypothetical without it, side by side, built from the same measured data behind every zone passport.",
    sr: 'Prikazuje kako jedan označen izuzetak — objekat čiji je hronitet znatno ispod norme zone — snižava ukupnu vrednost zone. Trenutno stanje naspram hipotetičkog bez njega, jedno pored drugog, zasnovano na istim izmerenim podacima iza svakog pasoša zone.',
  },
  'tia.zonePicker.label': { en: 'Zone', sr: 'Zona' },
  'tia.note.label': { en: 'About this view:', sr: 'O ovom prikazu:' },
  'tia.note.body': {
    en: "the coloured block is the zone's real, current chronity range and mean, over all measured objects. The faint block behind it is the same statistic recomputed over the remaining objects only, with the flagged outlier excluded — a real number, not an estimate. The step on the left shows the outlier's own chronity, at its own true height. Data currently shown is <code>ZN·ME·BJ·HN·001</code>'s pilot measurement set; wiring this to the live ZONES/PASSPORT_REGISTRY sheet is next on the list.",
    sr: 'obojeni blok je stvarni, trenutni raspon hroniteta zone i njegova srednja vrednost, preko svih izmerenih objekata. Bledi blok iza njega je ista statistika izračunata samo nad preostalim objektima, bez označenog izuzetka — stvarna vrednost, ne procena. Stepenik levo pokazuje stvarni hronitet samog izuzetka, na njegovoj pravoj visini. Trenutno prikazani podaci su pilot skup merenja za <code>ZN·ME·BJ·HN·001</code>; povezivanje sa live ZONES/PASSPORT_REGISTRY tabelom je sledeće na listi.',
  },

  // ── field.html: static UI chrome ──
  // CI Scale category names (Deep Chronity/High/Moderate/Low/No Chronity)
  // deliberately stay English, same as the ring/bar chart's own category
  // labels elsewhere on the site — they're data-classification terms, not
  // instructional prose.
  'field.subtitle':        { en: 'CI Field Data Collection', sr: 'Prikupljanje terenskih CI podataka' },
  'field.gpsLabel':         { en: 'GPS Coordinates', sr: 'GPS koordinate' },
  'field.zoneLabel':        { en: 'Zone', sr: 'Zona' },
  'field.btnCreateZone':    { en: '+ Create new zone here', sr: '+ Napravi novu zonu ovde' },
  'field.btnLaunch':        { en: '→ Open Field Form', sr: '→ Otvori terenski formular' },
  'field.formFallbackLink': { en: '↗ Trouble loading? Open form in new tab instead', sr: '↗ Problem sa učitavanjem? Otvori formular u novoj kartici' },
  'field.btnGetGps':        { en: '↻ Get GPS', sr: '↻ Preuzmi GPS' },
  'field.btnCopy':          { en: '⎘ Copy', sr: '⎘ Kopiraj' },
  'field.btnCheckStatus':   { en: '✓ Check my last submission', sr: '✓ Proveri moju poslednju prijavu' },
  'field.viewCiMap':        { en: '↗ View CI Map', sr: '↗ Pogledaj CI mapu' },
  'field.scaleTitle':       { en: 'CI Scale', sr: 'CI skala' },
  'field.footer':           { en: 'Understanding before change · ATRC 2026', sr: 'Razumevanje pre promene · ATRC 2026' },

  // ── field.html: dynamic status/error text, called via t(key, vars) from
  // the page's own JS rather than applied automatically to static markup —
  // these change too often (on every GPS fix) to live as data-i18n
  // elements. {placeholders} are substituted at call time; coordinates,
  // zone IDs, and CI numbers inside them stay as raw data either way. ──
  'field.status.tapToStart':   { en: 'Tap to get location', sr: 'Dodirnite za lokaciju' },
  'field.status.gpsNotSupported': { en: 'GPS not supported', sr: 'GPS nije podržan' },
  'field.status.detecting':    { en: 'Detecting location…', sr: 'Određivanje lokacije…' },
  'field.status.good':         { en: 'Good · ±{acc} m', sr: 'Dobro · ±{acc} m' },
  'field.status.improving':    { en: 'Improving… ±{acc} m', sr: 'Poboljšava se… ±{acc} m' },
  'field.status.searching':    { en: 'Searching… ±{acc} m', sr: 'Traženje… ±{acc} m' },
  'field.status.error':        { en: 'Error', sr: 'Greška' },

  'field.gps.searching':       { en: 'Searching…', sr: 'Traženje…' },
  'field.gps.accuracy':        { en: 'Accuracy: ±{acc} m', sr: 'Tačnost: ±{acc} m' },
  'field.gps.errNotSupported': { en: 'Geolocation not supported by this browser.', sr: 'Ovaj pregledač ne podržava geolokaciju.' },
  'field.gps.errPermission':   { en: 'Permission denied — allow location in browser', sr: 'Pristup odbijen — dozvolite lokaciju u pregledaču' },
  'field.gps.errUnavailable':  { en: 'Position unavailable — go outside', sr: 'Pozicija nedostupna — izađite napolje' },
  'field.gps.errTimeout':      { en: 'Timeout — tap Get GPS again', sr: 'Isteklo vreme — ponovo dodirnite Preuzmi GPS' },
  'field.gps.errGeneric':      { en: 'Location error', sr: 'Greška lokacije' },

  'field.zone.loading':        { en: 'Loading zones…', sr: 'Učitavanje zona…' },
  'field.zone.waitingGps':     { en: 'Waiting for GPS…', sr: 'Čekanje GPS-a…' },
  'field.zone.detected':       { en: '{zoneId} ✓', sr: '{zoneId} ✓' },
  'field.zone.manual':         { en: '{zoneId} (manual)', sr: '{zoneId} (ručno)' },
  'field.zone.outside':        { en: 'Outside known zones — pick manually below, or create a new zone', sr: 'Van poznatih zona — izaberite ručno ispod, ili napravite novu zonu' },
  'field.zone.selectManually': { en: '— select zone manually —', sr: '— izaberite zonu ručno —' },
  'field.zone.refreshing':     { en: 'Refreshing zone list…', sr: 'Osvežavanje liste zona…' },

  'field.createZone.notConfigured': { en: 'Web App URL not configured yet', sr: 'Web App URL još nije podešen' },
  'field.createZone.checking':      { en: 'Checking with server (local list may be a few minutes stale)…', sr: 'Provera na serveru (lokalna lista može biti zastarela nekoliko minuta)…' },
  'field.createZone.foundOnServer': { en: '✓ Found on server: {zoneId} (local list was just outdated)', sr: '✓ Pronađeno na serveru: {zoneId} (lokalna lista je bila zastarela)' },
  'field.createZone.openingEditor': { en: 'Opening zone editor in a new tab… draw & sync the zone there, then come back here.', sr: 'Otvaranje uređivača zona u novoj kartici… nacrtajte i sinhronizujte zonu tamo, pa se vratite ovde.' },
  'field.createZone.networkError':  { en: 'Network error checking server — try again, or open the map editor directly.', sr: 'Greška mreže pri proveri servera — pokušajte ponovo, ili otvorite uređivač mape direktno.' },

  'field.status.submittedChecking': { en: 'Submitted — checking…', sr: 'Poslato — proveravam…' },
  'field.status.checking':          { en: 'Checking…', sr: 'Proveravam…' },
  'field.status.notConfigured':     { en: 'Web App URL not configured yet', sr: 'Web App URL još nije podešen' },
  'field.status.anomalyFlag':       { en: '⚠ {name} — {flag}', sr: '⚠ {name} — {flag}' },
  'field.status.addedOk':           { en: '✓ {name} added, CI {ci}', sr: '✓ {name} dodato, CI {ci}' },
  'field.status.notConfirmedYet':   { en: 'Submitted, but not confirmed yet — tap "Check my last submission" in a moment', sr: 'Poslato, ali još nije potvrđeno — dodirnite "Proveri moju poslednju prijavu" za koji trenutak' },
  'field.status.retryNetworkError': { en: 'Network error — tap "Check my last submission" to retry', sr: 'Greška mreže — dodirnite "Proveri moju poslednju prijavu" da pokušate ponovo' },
  'field.status.errorPrefix':       { en: '✗ {error}', sr: '✗ {error}' },
  'field.status.notFound5min':      { en: 'No submission found in the last 5 min', sr: 'Nijedna prijava nije pronađena u poslednjih 5 min' },
  'field.status.retryError':        { en: 'Network error — try again', sr: 'Greška mreže — pokušajte ponovo' },

  'field.toast.getGpsFirst':      { en: 'Get GPS first', sr: 'Prvo preuzmite GPS' },
  'field.toast.copied':           { en: '✓ Copied: {text}', sr: '✓ Kopirano: {text}' },
  'field.toast.copyManually':     { en: 'Select and copy manually', sr: 'Izaberite i kopirajte ručno' },

  'field.marker.object':          { en: 'Object', sr: 'Objekat' },

  // ── gps.html ──
  'gps.status.requesting':   { en: 'Requesting location...', sr: 'Traženje lokacije...' },
  'gps.status.found':        { en: 'Location found', sr: 'Lokacija pronađena' },
  'gps.status.error':        { en: 'Error', sr: 'Greška' },
  'gps.coordsLabel':         { en: 'GPS Coordinates', sr: 'GPS koordinate' },
  'gps.coords.waiting':      { en: 'Waiting for GPS...', sr: 'Čekanje GPS-a...' },
  'gps.accuracy':            { en: 'Accuracy: \u00b1{acc} m', sr: 'Tačnost: \u00b1{acc} m' },
  'gps.btnCopy':              { en: '\ud83d\udccb &nbsp; Copy Coordinates', sr: '\ud83d\udccb &nbsp; Kopiraj koordinate' },
  'gps.btnCopied':            { en: '\u2713 Copied!', sr: '\u2713 Kopirano!' },
  'gps.btnRefresh':           { en: '\u21bb &nbsp; Refresh', sr: '\u21bb &nbsp; Osveži' },
  'gps.instruction.title':    { en: 'How to use:', sr: 'Kako se koristi:' },
  'gps.instruction.step1':    { en: 'Copy coordinates above', sr: 'Kopirajte koordinate iznad' },
  'gps.instruction.step2':    { en: 'Open the ATRC form', sr: 'Otvorite ATRC formular' },
  'gps.instruction.step3pre': { en: 'Paste into ', sr: 'Nalepite u polje ' },
  'gps.instruction.step3strong': { en: 'GPS coordinates', sr: 'GPS koordinate' },
  'gps.instruction.step3post':   { en: ' field', sr: '' },
  'gps.formLink':             { en: '\u2192 Open ATRC Field Form', sr: '\u2192 Otvori ATRC terenski formular' },
  'gps.err.notSupported':     { en: 'Geolocation not supported by this browser.', sr: 'Ovaj pregledač ne podržava geolokaciju.' },
  'gps.err.generic':          { en: 'Location error.', sr: 'Greška lokacije.' },
  'gps.err.permission':       { en: 'Permission denied. Allow location access in browser settings.', sr: 'Pristup odbijen. Dozvolite pristup lokaciji u podešavanjima pregledača.' },
  'gps.err.unavailable':      { en: 'Location unavailable. Try outdoors.', sr: 'Lokacija nedostupna. Pokušajte napolju.' },
  'gps.err.timeout':          { en: 'Timeout. Try again.', sr: 'Isteklo vreme. Pokušajte ponovo.' },
};

/**
 * t(key, vars) — for JS-driven text that changes too often to live as a
 * static data-i18n element (GPS status, error messages, etc.). Looks up
 * the CURRENT language automatically; call this fresh every time you set
 * a message, don't cache the result.
 *
 * Usage: t('field.status.good', { acc: 12 }) -> "Good · ±12 m" (or the
 * Serbian equivalent), substituting {acc} etc. from the vars object.
 */
function t(key, vars) {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  const lang = document.documentElement.getAttribute('lang') || 'en';
  let str = entry[lang] || entry.en;
  if (vars) {
    Object.keys(vars).forEach(k => { str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
  }
  return str;
}

function detectLanguage() {
  const saved = localStorage.getItem('atrc-lang');
  if (saved && LANGS.includes(saved)) return saved;
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return nav.startsWith('sr') ? 'sr' : 'en';
}

// Set immediately, synchronously, at script-load time — not deferred to
// DOMContentLoaded. document.documentElement always exists (even before
// <body> is parsed), and t() reads this attribute to pick a language, so
// it needs to be correct from the very first call. field.html in
// particular calls getLocation() -> setStatus() -> t() synchronously at
// load, before DOMContentLoaded fires; if this were set later, that very
// first status message would always show in English regardless of the
// detected language.
document.documentElement.setAttribute('lang', detectLanguage());

function applyLanguage(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const entry = TRANSLATIONS[key];
    if (!entry) return;
    // innerHTML, not textContent: a few entries (like note.body) carry
    // simple inline markup (<code>) that needs to survive translation.
    // Every string here is hand-written in this file, not user input, so
    // this is safe.
    el.innerHTML = entry[lang] || entry.en;
  });
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLanguage(lang) {
  if (!LANGS.includes(lang)) return;
  localStorage.setItem('atrc-lang', lang);
  applyLanguage(lang);
  document.dispatchEvent(new CustomEvent('atrc:langchange', { detail: { lang: lang } }));
}

function initLangToggle() {
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(detectLanguage());
  initLangToggle();
});
