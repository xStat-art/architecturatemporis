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

  // ── registry.html ──
  // Table itself (column headers, per-row status/audit-count text) stays
  // English throughout, same rule as everywhere else — it's data, not
  // instructional prose. CI category names in the filter dropdown also
  // stay English, matching the CI Scale on field.html.
  'registry.nav.methodology': { en: 'Methodology', sr: 'Metodologija' },
  'registry.nav.research':    { en: 'Research', sr: 'Istraživanje' },
  'registry.nav.contact':     { en: 'Contact', sr: 'Kontakt' },
  'registry.title':           { en: 'Global Index of Measured Places', sr: 'Globalni indeks izmerenih mesta' },
  'registry.subtitle':        { en: 'Every entry is a verified field measurement. CI computed from physical evidence — materials, acoustics, spatial integrity.', sr: 'Svaki unos je proverena terenska mera. CI se računa na osnovu fizičkih dokaza — materijala, akustike, prostornog integriteta.' },
  'registry.stat.objects':    { en: 'Objects', sr: 'Objekti' },
  'registry.stat.countries':  { en: 'Countries', sr: 'Zemlje' },
  'registry.stat.cities':     { en: 'Cities', sr: 'Gradovi' },
  'registry.stat.avgCi':      { en: 'Avg CI', sr: 'Prosečan CI' },
  'registry.filter.search':      { en: 'Search', sr: 'Pretraga' },
  'registry.filter.searchPh':    { en: 'Object name, CP·ID, zone…', sr: 'Naziv objekta, CP·ID, zona…' },
  'registry.filter.country':     { en: 'Country', sr: 'Zemlja' },
  'registry.filter.allCountries':{ en: 'All countries', sr: 'Sve zemlje' },
  'registry.filter.city':        { en: 'City', sr: 'Grad' },
  'registry.filter.allCities':   { en: 'All cities', sr: 'Svi gradovi' },
  'registry.filter.ciCategory':  { en: 'CI Category', sr: 'CI kategorija' },
  'registry.filter.allCategories': { en: 'All categories', sr: 'Sve kategorije' },
  'registry.filter.zone':        { en: 'Zone', sr: 'Zona' },
  'registry.filter.allZones':    { en: 'All zones', sr: 'Sve zone' },
  'registry.btnReset':           { en: 'Reset', sr: 'Resetuj' },
  'registry.loading':            { en: 'Loading…', sr: 'Učitavanje…' },
  'registry.loadingRegistry':    { en: 'Loading registry…', sr: 'Učitavanje registra…' },
  'registry.errorTitle':         { en: 'Could not load registry data', sr: 'Nije moguće učitati podatke registra' },
  'registry.errorSub':           { en: 'Check connection or try again later', sr: 'Proverite konekciju ili pokušajte kasnije' },
  'registry.sort.ci':            { en: 'Sort by CI', sr: 'Sortiraj po CI' },
  'registry.sort.year':          { en: 'Year', sr: 'Godina' },
  'registry.sort.name':          { en: 'Name', sr: 'Naziv' },
  'registry.emptyTitle':         { en: 'No objects match the current filters', sr: 'Nijedan objekat ne odgovara trenutnim filterima' },
  'registry.emptySub':           { en: 'Try widening your search', sr: 'Pokušajte da proširite pretragu' },
  'registry.footerRight':        { en: 'Registry auto-updates from field measurements', sr: 'Registar se automatski ažurira na osnovu terenskih merenja' },
  'registry.resultsCount.zero':   { en: '0 objects', sr: '0 objekata' },
  'registry.resultsCount.one':    { en: '1 object', sr: '1 objekat' },
  'registry.resultsCount.many':   { en: '{n} objects', sr: '{n} objekata' },

  // ── ATRC_CI_Map.html ──
  // Region codes (BJ/BR/BA/UL + their names), UNESCO status values
  // (none/buffer/core), and CI category names stay English throughout —
  // same rule as everywhere else: classification/enum values are data,
  // not instructional prose.
  'map.title':            { en: 'Spectral CI Map', sr: 'Spektralna CI mapa' },
  'map.backToField':      { en: '\u2190 Field', sr: '\u2190 Teren' },
  'map.editZones':        { en: '\u270e Edit Zones', sr: '\u270e Izmeni zone' },
  'map.refresh':          { en: '\u21bb Refresh', sr: '\u21bb Osveži' },
  'map.editBanner':       { en: 'Click on the map to add vertices', sr: 'Kliknite na mapu da dodate tačke' },
  'map.editZonesTitle':   { en: 'Edit Zones', sr: 'Izmena zona' },
  'map.drawContour':      { en: 'Draw contour', sr: 'Nacrtaj konturu' },
  'map.drawHint': {
    en: 'Trace the zone by physical boundaries (fortress wall, road, terrain, coastline) — not administrative borders. Existing measured objects (colored dots) are shown on the map — draw around them. After "Finish contour", vertices within a few meters of a real OSM street/wall line snap to it automatically, then vertices near an already-drawn neighboring zone snap to that zone\'s edge too — so adjacent zones share a clean border instead of a gap or overlap.',
    sr: 'Ocrtajte zonu prema fizičkim granicama (zid tvrđave, put, teren, obala) — ne prema administrativnim granicama. Postojeći izmereni objekti (obojene tačke) prikazani su na mapi — crtajte oko njih. Nakon "Finish contour", tačke unutar nekoliko metara od stvarne OSM ulice/zida se automatski uklapaju u nju, a zatim se tačke blizu već nacrtane susedne zone uklapaju i u njenu ivicu — tako susedne zone dele čistu granicu umesto praznine ili preklapanja.',
  },
  'map.vertices':         { en: 'Vertices:', sr: 'Tačke:' },
  'map.startDrawing':     { en: 'Start drawing', sr: 'Počni crtanje' },
  'map.undoPoint':        { en: 'Undo point', sr: 'Poništi tačku' },
  'map.finishContour':    { en: 'Finish contour', sr: 'Završi konturu' },
  'map.cancelDrawing':    { en: 'Cancel drawing', sr: 'Otkaži crtanje' },
  'map.editExisting':     { en: 'Edit existing saved zone', sr: 'Izmeni postojeću sačuvanu zonu' },
  'map.editExistingHint': {
    en: "These are zones already stored in the ZONES sheet. Editing loads the real saved contour into the drawer above — fix it (e.g. re-run OSM snapping after this session's update) and save under the same Zone ID to overwrite.",
    sr: 'Ovo su zone koje su već sačuvane u ZONES tabeli. Izmena učitava stvarno sačuvanu konturu u alat za crtanje iznad — ispravite je (npr. ponovo pokrenite OSM uklapanje nakon izmene u ovoj sesiji) i sačuvajte pod istim Zone ID da biste je prepisali.',
  },
  'map.allCities':        { en: 'All cities', sr: 'Svi gradovi' },
  'map.loadingEllipsis':  { en: 'Loading…', sr: 'Učitavanje…' },
  'map.zoneDetails':      { en: 'Zone details', sr: 'Detalji zone' },
  'map.regionCode':       { en: 'Region code (established coastal division)', sr: 'Kod regiona (utvrđena podela obale)' },
  'map.cityCode':         { en: 'City code (e.g. HN, KO, PR, RI)', sr: 'Kod grada (npr. HN, KO, PR, RI)' },
  'map.mismatchAck':      { en: "I've checked — this location and City code are correct. Save anyway.", sr: 'Proverio/la sam — ova lokacija i kod grada su tačni. Ipak sačuvaj.' },
  'map.zoneIdLabel':      { en: 'Zone ID (ZN·ME·{region}·{city}·###)', sr: 'Zone ID (ZN·ME·{region}·{city}·###)' },
  'map.displayName':      { en: 'Display name', sr: 'Prikazani naziv' },
  'map.displayNamePh':    { en: 'e.g. Herceg Novi — Stari Grad', sr: 'npr. Herceg Novi — Stari Grad' },
  'map.ciZoneLabel':      { en: 'CI_zone (optional, can be filled later)', sr: 'CI_zone (opciono, može se popuniti kasnije)' },
  'map.centralCheckbox':  { en: 'This is the central/historic core zone (one per city — reserves ···001)', sr: 'Ovo je centralna/istorijska jezgro zona (jedna po gradu — rezerviše ···001)' },
  'map.centralHint': {
    en: 'The central zone anchors Prior_CI for all other zones in the same city. Number ···001 is reserved for it — non-central zones always start at ···002, even if created first. <b>This checkbox only changes the number — it does NOT detect or change which city/region the zone belongs to.</b> Set City code above correctly first.',
    sr: 'Centralna zona određuje Prior_CI za sve ostale zone u istom gradu. Broj ···001 je rezervisan za nju — necentralne zone uvek počinju od ···002, čak i ako su napravljene prve. <b>Ovaj checkbox menja samo broj — NE prepoznaje niti menja kom gradu/regionu zona pripada.</b> Prvo ispravno podesite kod grada iznad.',
  },
  'map.unescoStatus':     { en: 'UNESCO status', sr: 'UNESCO status' },
  'map.saveZone':         { en: 'Save zone', sr: 'Sačuvaj zonu' },
  'map.discard':          { en: 'Discard', sr: 'Odbaci' },
  'map.noZonesSession':   { en: 'No zones drawn yet this session', sr: 'U ovoj sesiji još nije nacrtana nijedna zona' },
  'map.syncRegistry':     { en: 'Sync to live registry', sr: 'Sinhronizuj sa live registrom' },
  'map.syncHint':         { en: 'Sends all zones above directly to the ZONES sheet.', sr: 'Šalje sve zone iznad direktno u ZONES tabelu.' },
  'map.syncBtn':          { en: '\u2b06 Save all zones to sheet', sr: '\u2b06 Sačuvaj sve zone u tabelu' },
  'map.recalcBtn':        { en: '\u21bb Recalculate zone assignments', sr: '\u21bb Ponovo izračunaj dodelu zona' },
  'map.recalcHint':       { en: 'Run after editing a boundary — fixes Zone_ID on existing objects whose GPS now falls in a different zone.', sr: 'Pokrenite nakon izmene granice — ispravlja Zone_ID kod postojećih objekata čiji GPS sada pripada drugoj zoni.' },
  'map.loadingFieldData': { en: 'Loading field data', sr: 'Učitavanje terenskih podataka' },
  'map.zoneSummary':      { en: 'Zone Summary', sr: 'Pregled zone' },
  'map.category':         { en: 'Category', sr: 'Kategorija' },
  'map.weightedByPsm':    { en: 'weighted by PSM', sr: 'ponderisano sa PSM' },
  'map.objects':          { en: 'Objects', sr: 'Objekti' },
  'map.minCi':            { en: 'Min CI (w)', sr: 'Min CI (w)' },
  'map.maxCi':            { en: 'Max CI (w)', sr: 'Maks CI (w)' },
  'map.legendTitle':      { en: 'Chronity Index (weighted) · Spectral Scale', sr: 'Hronitetni indeks (ponderisan) · Spektralna skala' },
  'map.legendSplitNote':  { en: '\u2190 CI \u00d7 PSM=1.0 · 1.0\u20131.5 = PSM &gt; 1.0 (national/UNESCO) \u2192', sr: '\u2190 CI \u00d7 PSM=1.0 · 1.0\u20131.5 = PSM &gt; 1.0 (nacionalni/UNESCO) \u2192' },

  // ── ATRC_CI_Map.html: dynamic alerts/confirms/status text ──
  'map.alert.cityRequired':     { en: 'City code is required (e.g. HN, KT)', sr: 'Kod grada je obavezan (npr. HN, KT)' },
  'map.alert.zoneIdRequired':   { en: 'Zone ID is required', sr: 'Zone ID je obavezan' },
  'map.alert.needThreeVertices':{ en: 'Draw at least 3 vertices first', sr: 'Prvo nacrtajte bar 3 tačke' },
  'map.alert.farFromOtherZones':{ en: 'This contour is ~{km} km from other "{city}" zones.\n\nTick the confirmation checkbox above if the location is really correct, or fix the City code.', sr: 'Ova kontura je ~{km} km od drugih "{city}" zona.\n\nOznačite polje za potvrdu iznad ako je lokacija zaista tačna, ili ispravite kod grada.' },
  'map.alert.centralMustBe001': { en: 'Central zone must use number ···001 (got ···{num}). Fix the Zone ID or uncheck "central".', sr: 'Centralna zona mora koristiti broj ···001 (dobijeno ···{num}). Ispravite Zone ID ili isključite "central".' },
  'map.alert.reserved001':      { en: '···001 is reserved for the central/historic core zone. Check "central" above, or change the Zone ID number.', sr: '···001 je rezervisano za centralnu/istorijsku jezgro zonu. Označite "central" iznad, ili promenite broj u Zone ID.' },
  'map.confirm.replaceCentral': { en: '"{other}" is currently marked central for {city} in this session. Make "{name}" central instead?', sr: '"{other}" je trenutno označena kao centralna za {city} u ovoj sesiji. Da li "{name}" postane centralna umesto nje?' },
  'map.alert.finishFirst':      { en: 'Finish or cancel the current drawing first.', sr: 'Prvo završite ili otkažite trenutno crtanje.' },
  'map.confirm.deleteZone':     { en: 'Delete zone "{name}"?', sr: 'Obrisati zonu "{name}"?' },
  'map.emptyNoSavedYet':        { en: 'No saved zones loaded yet', sr: 'Sačuvane zone još nisu učitane' },
  'map.emptyNoSavedForCity':    { en: 'No saved zones for this city', sr: 'Nema sačuvanih zona za ovaj grad' },
  'map.alert.noSavedGeometry':  { en: 'No saved geometry found for this zone — it may predate geometry sync, or its Polygon_GeoJSON failed to parse.', sr: 'Nije pronađena sačuvana geometrija za ovu zonu — možda je starija od sinhronizacije geometrije, ili njen Polygon_GeoJSON nije uspeo da se parsira.' },
  'map.confirm.recalcAll':      { en: 'Recalculate Zone_ID for every existing object in PASSPORT_REGISTRY against the zone boundaries currently saved in the sheet?', sr: 'Ponovo izračunati Zone_ID za svaki postojeći objekat u PASSPORT_REGISTRY u odnosu na granice zona trenutno sačuvane u tabeli?' },
  'map.alert.overwriteWarning': {
    en: '"{znId}" already exists in the saved ZONES sheet{priorNote}.\n\nSaving here will OVERWRITE its contour geometry the next time you sync — even if it\'s a measured/central zone with real field data.\n\nTick the confirmation checkbox above if you really intend to update that exact zone\'s boundary, or fix the City code / Zone ID first.',
    sr: '"{znId}" već postoji u sačuvanoj ZONES tabeli{priorNote}.\n\nČuvanje ovde će PREPISATI njenu geometriju konture pri sledećoj sinhronizaciji — čak i ako je u pitanju izmerena/centralna zona sa stvarnim terenskim podacima.\n\nOznačite polje za potvrdu iznad ako zaista nameravate da ažurirate granicu baš te zone, ili prvo ispravite kod grada / Zone ID.',
  },
  'map.priorNote':              { en: ' (Prior_CI {ci})', sr: ' (Prior_CI {ci})' },
  'map.zoneCountSuffix':        { en: '{n} zone{s}', sr: '{n} zon{s}' },
  'map.badge.central':          { en: '\u2605 central', sr: '\u2605 centralna' },
  'map.badge.synced':           { en: '\u2713 synced', sr: '\u2713 sinhronizovano' },
  'map.card.alreadySaved':      { en: 'Already saved — will appear in "Edit existing saved zone" above once Google\'s CSV cache refreshes (usually a few minutes).', sr: 'Već sačuvano — pojaviće se u "Edit existing saved zone" iznad kada se Google-ov CSV keš osveži (obično nekoliko minuta).' },
  'map.card.unescoPrefix':      { en: ' · UNESCO: {status}', sr: ' · UNESCO: {status}' },
  'map.card.vertices':          { en: '{n} vertices · CI_zone: {ci}', sr: '{n} tačaka · CI_zone: {ci}' },
  'map.btn.focus':               { en: 'Focus', sr: 'Fokus' },
  'map.btn.edit':                { en: 'Edit', sr: 'Izmeni' },
  'map.btn.delete':              { en: 'Delete', sr: 'Obriši' },
  'map.card.verticesSaved':      { en: '{n} vertices (saved)', sr: '{n} tačaka (sačuvano)' },
  'map.card.noSavedGeometry':    { en: 'no saved geometry (Polygon_GeoJSON empty/unparseable)', sr: 'nema sačuvane geometrije (Polygon_GeoJSON prazan/nečitljiv)' },
  'map.btn.editSavedContour':    { en: 'Edit saved contour', sr: 'Izmeni sačuvanu konturu' },

  // ── ATRC_CI_Map.html: setEdStatus-driven status bar messages ──
  'map.geo.detected':            { en: '\ud83d\udccd Detected: {city}{muni} ({km} km from its other zones)', sr: '\ud83d\udccd Prepoznato: {city}{muni} ({km} km od ostalih njenih zona)' },
  'map.geo.detectedPlanned':     { en: '\ud83d\udccd Detected: {city}{muni} — planned settlement, no zones drawn there yet ({km} km from its approximate center)', sr: '\ud83d\udccd Prepoznato: {city}{muni} — planirano naselje, tu još nisu nacrtane zone ({km} km od njegovog približnog centra)' },
  'map.geo.notDetected':         { en: '\ud83d\udccd No known/planned settlement within {km} km — new area, City code must be entered manually.', sr: '\ud83d\udccd Nema poznatog/planiranog naselja u krugu od {km} km — nova oblast, kod grada mora biti unet ručno.' },
  'map.geo.muniSuffix':          { en: ' · {muni} Municipality', sr: ' · Opština {muni}' },
  'map.mismatch.warning':        { en: '\u26a0 This contour is ~{km} km from other "{city}" zones. Double-check the city code above — did the location change?', sr: '\u26a0 Ova kontura je ~{km} km od drugih "{city}" zona. Proverite kod grada iznad — da li se lokacija promenila?' },
  'map.snap.busy':               { en: 'Snapping contour to OSM streets/walls…', sr: 'Uklapanje konture u OSM ulice/zidove…' },
  'map.snap.ok':                 { en: '\u2713 {snapped} of {total} vertices snapped to OSM lines (\u2264{tol}m).{added}', sr: '\u2713 {snapped} od {total} tačaka uklopljeno u OSM linije (\u2264{tol}m).{added}' },
  'map.snap.zoneEdgeAppend':     { en: ' · +{n} vertices aligned to neighboring zone edges (\u2264{tol}m).', sr: ' · +{n} tačaka poravnato sa ivicama susednih zona (\u2264{tol}m).' },
  'map.snap.curvePointsAdded':   { en: ' +{n} curve points added', sr: ' +{n} tačaka krivine dodato' },
  'map.snap.none':               { en: 'No OSM lines found within {tol}m — contour kept exactly as drawn.', sr: 'Nisu pronađene OSM linije u krugu od {tol}m — kontura je zadržana tačno onako kako je nacrtana.' },
  'map.snap.err':                { en: '\u2715 OSM snap unavailable ({err}) — contour kept exactly as drawn, nothing lost.', sr: '\u2715 OSM uklapanje nedostupno ({err}) — kontura je zadržana tačno onako kako je nacrtana, ništa nije izgubljeno.' },
  'map.sync.sending':            { en: 'Sending {n} zone(s) to the sheet…', sr: 'Slanje {n} zona(e) u tabelu…' },
  'map.sync.saved':              { en: '\u2713 Saved {n} zone(s). {priorLines}', sr: '\u2713 Sačuvano {n} zona(e). {priorLines}' },
  'map.sync.err':                { en: '\u2715 {error}', sr: '\u2715 {error}' },
  'map.sync.networkErr':         { en: '\u2715 Network error: {error}', sr: '\u2715 Greška mreže: {error}' },
  'map.recalc.busy':             { en: 'Recalculating…', sr: 'Ponovno izračunavanje…' },
  'map.recalc.noChanges':        { en: '\u2713 No changes needed.', sr: '\u2713 Nisu potrebne izmene.' },
  'map.recalc.updated':          { en: '\u2713 Updated {n} object(s):<br>{lines}', sr: '\u2713 Ažurirano {n} objekat(a):<br>{lines}' },
  'map.recalc.err':              { en: '\u2715 {error}', sr: '\u2715 {error}' },
  'map.recalc.networkErr':       { en: '\u2715 Network error: {error}', sr: '\u2715 Greška mreže: {error}' },
  'map.sync.priorLine':          { en: '{zoneId}: {value}', sr: '{zoneId}: {value}' },
  'map.sync.priorCiValue':       { en: 'Prior_CI {ci}', sr: 'Prior_CI {ci}' },
  'map.sync.noPrior':            { en: 'central / no prior', sr: 'centralna / bez prethodne' },
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
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const entry = TRANSLATIONS[key];
    if (!entry) return;
    el.setAttribute('placeholder', entry[lang] || entry.en);
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
  const lang = detectLanguage();
  applyLanguage(lang);
  initLangToggle();
  // Same event manual switches dispatch — without this, any element that
  // gets its real content set by JS *before* DOMContentLoaded fires (GPS
  // status, results count, etc.) gets silently clobbered back to its
  // static placeholder text right here, and nothing ever fixes it unless
  // the person happens to also toggle the language manually afterward.
  // Found this exact bug in field.html's status text and registry.html's
  // results count while testing — this single fix covers every page that
  // registers an atrc:langchange listener, current and future, rather
  // than requiring each page to carefully avoid data-i18n on any element
  // that's also dynamically managed.
  document.dispatchEvent(new CustomEvent('atrc:langchange', { detail: { lang: lang } }));
});
