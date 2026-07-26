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
};

function detectLanguage() {
  const saved = localStorage.getItem('atrc-lang');
  if (saved && LANGS.includes(saved)) return saved;
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return nav.startsWith('sr') ? 'sr' : 'en';
}

function applyLanguage(lang) {
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
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLanguage(lang) {
  if (!LANGS.includes(lang)) return;
  localStorage.setItem('atrc-lang', lang);
  applyLanguage(lang);
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
