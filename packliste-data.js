/* ============================================================
   PACKLISTE-DATA.JS: Inhalte fuer den Packlisten-Generator
   (packliste.html, Logik in packliste-tool.js)
   ------------------------------------------------------------
   FRAGEN: die Auswahl oben im Generator. Jede Frage hat einen
   key, die Antworten landen als Liste von Werten unter diesem key
   (auch bei Einfachauswahl, dann mit genau einem Wert). icon ist
   optional (Emoji vor dem Label), genauso bei KATEGORIEN und
   VORLAGEN (dort zusaetzlich text als kurze Beschreibung).

   TEILE: jedes Teil der Liste.
     id        eindeutig und dauerhaft (steckt in gespeicherten und
               geteilten Listen, also nie umbenennen)
     kat       Kategorie-key aus KATEGORIEN
     text      Anzeigetext. {menge} wird durch die Menge ersetzt.
     menge     optional: je Reisedauer (kurz, mittel, lang,
               sehrlang). Fehlt eine Dauer, gilt "standard".
     tipp      unser Ratgeber-Satz zum Teil (ⓘ in der Liste)
     wenn      optional: Teil kommt dazu, sobald EINE der Angaben
               passt, z.B. { klima: ['kalt'], aktiv: ['wandern'] }
     nur       optional: Teil kommt nur dazu, wenn ALLE Angaben
               passen, z.B. { gepaeck: ['handgepaeck'] }
     Ohne wenn und nur gehoert ein Teil immer dazu.

   VORLAGEN: fertige Antworten zum Schnellstart.

   WICHTIG: keine Gedankenstriche in Texten (Projekt-Stil).
   ============================================================ */

window.PACKLISTE = {

  FRAGEN: [
    {
      key: 'klima', titel: 'Welches Klima erwartet dich?', mehrfach: true,
      optionen: [
        { wert: 'tropisch',   icon: '☀️', label: 'Tropisch und heiß' },
        { wert: 'kalt',       icon: '🏔️', label: 'Kalt oder große Höhe' },
        { wert: 'wueste',     icon: '🏜️', label: 'Wüste' },
        { wert: 'gemaessigt', icon: '🌤️', label: 'Gemäßigt' },
        { wert: 'regen',      icon: '🌧️', label: 'Regenzeit' }
      ]
    },
    {
      key: 'dauer', titel: 'Wie lange bist du unterwegs?', mehrfach: false,
      optionen: [
        { wert: 'kurz',     label: 'Bis 1 Woche' },
        { wert: 'mittel',   label: 'Bis 4 Wochen' },
        { wert: 'lang',     label: '1 bis 3 Monate' },
        { wert: 'sehrlang', label: 'Länger' }
      ]
    },
    {
      key: 'gepaeck', titel: 'Womit reist du?', mehrfach: false,
      optionen: [
        { wert: 'handgepaeck', icon: '🎒', label: 'Nur Handgepäck' },
        { wert: 'rucksack',    icon: '🏕️', label: 'Großer Rucksack' },
        { wert: 'koffer',      icon: '🧳', label: 'Koffer' }
      ]
    },
    {
      key: 'unterkunft', titel: 'Wo schläfst du?', mehrfach: true,
      optionen: [
        { wert: 'hostel',  icon: '🛏️', label: 'Hostels' },
        { wert: 'hotel',   icon: '🏨', label: 'Hotels oder Apartments' },
        { wert: 'camping', icon: '⛺', label: 'Camping' }
      ]
    },
    {
      key: 'aktiv', titel: 'Was hast du vor?', mehrfach: true,
      optionen: [
        { wert: 'wandern',   icon: '🥾', label: 'Wandern und Trekking' },
        { wert: 'strand',    icon: '🏝️', label: 'Strand und Schnorcheln' },
        { wert: 'dschungel', icon: '🌿', label: 'Dschungel' },
        { wert: 'staedte',   icon: '🏙️', label: 'Städte' },
        { wert: 'boot',      icon: '⛵', label: 'Bootstouren' },
        { wert: 'arbeiten',  icon: '💻', label: 'Arbeiten unterwegs' },
        { wert: 'filmen',    icon: '🎥', label: 'Filmen und Fotografieren' },
        { wert: 'drohne',    icon: '🚁', label: 'Drohne' }
      ]
    },
    {
      key: 'fern', titel: 'Reist du außerhalb von EU und Schengen?', mehrfach: false,
      optionen: [
        { wert: 'ja',   label: 'Ja' },
        { wert: 'nein', label: 'Nein' }
      ]
    }
  ],

  KATEGORIEN: [
    { key: 'rucksack',   icon: '🎒', titel: 'Rucksack und Organisation', intro: 'Dein Zuhause auf dem Rücken. Weniger ist hier wörtlich mehr.' },
    { key: 'kleidung',   icon: '👕', titel: 'Kleidung',                  intro: 'Zwiebelprinzip statt Spezialkleidung. Waschen kannst du fast überall, günstig und kiloweise.' },
    { key: 'technik',    icon: '🔌', titel: 'Technik',                   intro: 'So viel wie nötig, so wenig wie möglich. Steckdosen sind in Bussen Glückssache.' },
    { key: 'dokumente',  icon: '🛂', titel: 'Dokumente und Geld',        intro: 'Der Teil, den du nicht vor Ort nachkaufen kannst. Zweimal prüfen.' },
    { key: 'gesundheit', icon: '🩹', titel: 'Gesundheit und Hygiene',    intro: 'Apotheken gibt es fast überall, aber nachts im Bus hilft dir nur, was du dabeihast.' },
    { key: 'sonstiges',  icon: '🧰', titel: 'Sonstiges und Kleinkram',   intro: 'Wiegt fast nichts, rettet aber regelmäßig den Tag.' }
  ],

  TEILE: [
    /* ── Rucksack und Organisation ─────────────────────────── */
    { id: 'rucksack-hand', kat: 'rucksack', text: 'Hauptrucksack, 40 Liter, Handgepäckmaß',
      tipp: 'Unsere Rucksäcke haben 40 Liter und passen in die Kabine. Das spart bei jedem Flug Gepäckgebühren, und nichts geht verloren.',
      nur: { gepaeck: ['handgepaeck'] } },
    { id: 'rucksack-gross', kat: 'rucksack', text: 'Reiserucksack, 45 bis 60 Liter',
      tipp: 'Lieber eine Nummer kleiner: Was Platz hat, wird auch vollgepackt. Ein Rucksack mit Frontöffnung erspart dir das ständige Auspacken.',
      nur: { gepaeck: ['rucksack'] } },
    { id: 'koffer', kat: 'rucksack', text: 'Koffer oder Trolley',
      tipp: 'Gut für feste Unterkünfte. Für Kopfsteinpflaster und Busbahnhöfe sind große, robuste Rollen Gold wert.',
      nur: { gepaeck: ['koffer'] } },
    { id: 'daypack', kat: 'rucksack', text: 'Daypack, ca. 20 Liter',
      tipp: 'Für Ausflüge und als Handgepäck im Bus. Wertsachen gehören hier hinein, nicht in den Gepäckraum.' },
    { id: 'packwuerfel', kat: 'rucksack', text: 'Packwürfel, {menge}',
      menge: { kurz: '2 bis 3 Stück', standard: '4 bis 6 Stück' },
      tipp: 'Ein Würfel pro Kleidungsart, dann findest du alles ohne den ganzen Rucksack auszuräumen.' },
    { id: 'regenhuelle', kat: 'rucksack', text: 'Regenhülle für den Rucksack',
      tipp: 'Schützt auch vor Staub und Schmutz auf Busdächern und in Gepäckräumen.',
      nur: { gepaeck: ['handgepaeck', 'rucksack'] } },
    { id: 'drybag', kat: 'rucksack', text: 'Drybag, 10 Liter',
      tipp: 'Für Bootstouren, Regenwanderungen und als Wäschesack. Hält Kamera und Handy trocken.',
      wenn: { aktiv: ['boot', 'strand', 'dschungel'], klima: ['regen'] } },
    { id: 'brustbeutel', kat: 'rucksack', text: 'Brustbeutel oder flache Bauchtasche',
      tipp: 'Pass und Karte direkt am Körper, vor allem an Busbahnhöfen und auf vollen Märkten.' },
    { id: 'schloss', kat: 'rucksack', text: 'Kleines Zahlenschloss, 2 Stück',
      tipp: 'Für Hostel-Spinde und den Reißverschluss am Rucksack. Zahlenschloss statt Schlüssel, der geht nicht verloren.',
      wenn: { unterkunft: ['hostel'] } },
    { id: 'stoffbeutel', kat: 'rucksack', text: 'Faltbarer Stoffbeutel für Einkäufe',
      tipp: 'Wiegt nichts und spart dir unterwegs unzählige Plastiktüten.' },

    /* ── Kleidung ──────────────────────────────────────────── */
    { id: 'merino', kat: 'kleidung', text: 'Merino-Shirts, {menge}',
      menge: { kurz: '2 Stück', standard: '3 Stück' },
      tipp: 'Merino trocknet schnell und riecht auch nach Tag drei nicht. Teurer, aber jeden Cent wert.' },
    { id: 'tshirts', kat: 'kleidung', text: 'T-Shirts, {menge}',
      menge: { kurz: '2 Stück', standard: '2 bis 3 Stück' },
      tipp: 'Für Stadt und Strand. Was fehlt, kaufst du vor Ort günstig nach.' },
    { id: 'langarm', kat: 'kleidung', text: 'Langarmshirt, dünn (Sonne, Mücken)',
      tipp: 'Schützt besser als jede Sonnencreme und hält Mücken ab, wenn es dämmert.',
      wenn: { klima: ['tropisch', 'wueste'], aktiv: ['dschungel', 'wandern'] } },
    { id: 'fleece', kat: 'kleidung', text: 'Fleece oder warmer Pulli',
      tipp: 'Die mittlere Schicht im Zwiebelprinzip. Auch in der Wüste wird es nachts kalt.',
      wenn: { klima: ['kalt', 'gemaessigt', 'wueste'] } },
    { id: 'daune', kat: 'kleidung', text: 'Daunenjacke, klein packbar',
      tipp: 'Morgens frierend auf 4.800 Metern, abends im Dschungel: Eine leichte Daunenjacke passt in jede Ecke des Rucksacks.',
      wenn: { klima: ['kalt'] } },
    { id: 'regenjacke', kat: 'kleidung', text: 'Regenjacke, wirklich wasserdicht',
      tipp: 'Gleichzeitig deine Windjacke. Drei dünne Schichten schlagen jede dicke Jacke.' },
    { id: 'regenhose', kat: 'kleidung', text: 'Leichte Regenhose',
      tipp: 'In der Regenzeit kommt der Schauer jeden Nachmittag. Mit Regenhose ist das egal.',
      wenn: { klima: ['regen'] } },
    { id: 'wanderhose', kat: 'kleidung', text: 'Wanderhose, leicht',
      tipp: 'Trocknet schnell und schützt die Beine im Dschungel vor Mücken und Dornen.',
      wenn: { aktiv: ['wandern', 'dschungel'], klima: ['kalt'] } },
    { id: 'kurzehosen', kat: 'kleidung', text: 'Kurze Hosen, 2 Stück',
      tipp: 'Eine sportliche, eine für die Stadt, das reicht.',
      wenn: { klima: ['tropisch', 'wueste', 'gemaessigt'], aktiv: ['strand'] } },
    { id: 'bequemehose', kat: 'kleidung', text: 'Eine bequeme Hose für lange Fahrten',
      tipp: 'Für Nachtbusse und lange Flüge. In klimatisierten Bussen ist es oft eiskalt.' },
    { id: 'unterwaesche', kat: 'kleidung', text: 'Unterwäsche {menge}',
      menge: { kurz: 'für 5 Tage', standard: 'für 7 Tage' },
      tipp: 'Mehr als eine Woche brauchst du nie, gewaschen wird einmal pro Woche.' },
    { id: 'wandersocken', kat: 'kleidung', text: 'Wandersocken, 3 Paar',
      tipp: 'Gute Wandersocken verhindern mehr Blasen als jedes Pflaster.',
      wenn: { aktiv: ['wandern'], klima: ['kalt'] } },
    { id: 'socken', kat: 'kleidung', text: 'Normale Socken, {menge}',
      menge: { kurz: '3 Paar', standard: '4 Paar' },
      tipp: 'Dünne Socken trocknen über Nacht.' },
    { id: 'muetze', kat: 'kleidung', text: 'Mütze und dünne Handschuhe',
      tipp: 'Für Sonnenaufgänge in der Höhe und kalte Nächte. Gibt es auf jedem Andenmarkt, falls du sie vergisst.',
      wenn: { klima: ['kalt'] } },
    { id: 'buff', kat: 'kleidung', text: 'Buff oder Halstuch',
      tipp: 'Gegen Staub, Wind, Sonne und Kälte. Eines der vielseitigsten Teile im Rucksack.',
      wenn: { klima: ['kalt', 'wueste'] } },
    { id: 'cap', kat: 'kleidung', text: 'Cap oder Sonnenhut',
      tipp: 'In der Höhe und am Äquator ist die Sonne viel stärker, als sie sich anfühlt.' },
    { id: 'badesachen', kat: 'kleidung', text: 'Badesachen',
      tipp: 'Auch für heiße Quellen und Hostel-Pools.',
      wenn: { klima: ['tropisch'], aktiv: ['strand', 'boot'] } },
    { id: 'outfit', kat: 'kleidung', text: 'Ein Outfit zum Ausgehen',
      tipp: 'Ein Teil, das gut aussieht und nicht knittert, reicht für Restaurant und Bar.',
      wenn: { aktiv: ['staedte'] } },
    { id: 'wanderschuhe', kat: 'kleidung', text: 'Eingelaufene Wanderschuhe',
      tipp: 'Bring sie von zu Hause mit und lauf sie vorher ein. Gute Schuhe gehören zu den wenigen Dingen, die du unterwegs schwer bekommst.',
      wenn: { aktiv: ['wandern', 'dschungel'], klima: ['kalt'] } },
    { id: 'sneaker', kat: 'kleidung', text: 'Bequeme Sneaker',
      tipp: 'Für Stadttage. Das dritte Paar Schuhe für besondere Anlässe kannst du zu Hause lassen.' },
    { id: 'flipflops', kat: 'kleidung', text: 'Flip-Flops',
      tipp: 'Für Hostelduschen, Strand und den Weg zum Frühstück.' },

    /* ── Technik ───────────────────────────────────────────── */
    { id: 'smartphone', kat: 'technik', text: 'Smartphone mit eSIM',
      tipp: 'Mit eSIM hast du direkt nach der Landung Internet. Offline-Karten vorher herunterladen.' },
    { id: 'powerbank', kat: 'technik', text: 'Powerbank, mindestens 10.000 mAh',
      tipp: 'Steckdosen in Bussen sind Glückssache. Achtung: Powerbanks gehören ins Handgepäck.' },
    { id: 'adapter', kat: 'technik', text: 'Universaladapter mit USB-Ports',
      tipp: 'Ein Adapter mit mehreren USB-Ports lädt alles gleichzeitig über eine einzige Steckdose.',
      wenn: { fern: ['ja'] } },
    { id: 'kopfhoerer', kat: 'technik', text: 'Kopfhörer mit Geräuschunterdrückung',
      tipp: 'Rettet jede Nachtfahrt neben dem Lautsprecher mit Busfilm.' },
    { id: 'kabel', kat: 'technik', text: 'Ladekabel, kurz und in doppelter Ausführung',
      tipp: 'Ein Kabel geht immer verloren, meistens im letzten Hostel.' },
    { id: 'stirnlampe', kat: 'technik', text: 'Stirnlampe',
      tipp: 'Für Stromausfälle, frühe Starts zum Sonnenaufgang und den Schlafsaal, ohne alle zu wecken.',
      wenn: { unterkunft: ['hostel', 'camping'], aktiv: ['wandern', 'dschungel'] } },
    { id: 'kamera', kat: 'technik', text: 'Kamera oder GoPro, mit Ersatzakku',
      tipp: 'Wir filmen unsere Vlogs mit der DJI Osmo Pocket 4 und dem iPhone 17 Pro.',
      wenn: { aktiv: ['filmen'] } },
    { id: 'drohne', kat: 'technik', text: 'Drohne mit Ersatzakkus',
      tipp: 'Unsere ist eine DJI Mini 3. Vorher die Drohnenregeln jedes Landes prüfen, in manchen brauchst du eine Registrierung.',
      wenn: { aktiv: ['drohne'] } },
    { id: 'backup', kat: 'technik', text: 'Speicherkarten und Backup (Festplatte oder Cloud)',
      tipp: 'Aufnahmen immer doppelt sichern. Ein geklautes Handy ist ärgerlich, verlorene Erinnerungen sind schlimmer.',
      wenn: { aktiv: ['filmen', 'drohne', 'arbeiten'] } },
    { id: 'laptop', kat: 'technik', text: 'Laptop oder Tablet',
      tipp: 'Nur wenn du unterwegs arbeitest oder schneidest. Sonst reicht das Handy.',
      wenn: { aktiv: ['arbeiten'] } },
    { id: 'handyhuelle', kat: 'technik', text: 'Wasserdichte Handyhülle',
      tipp: 'Für Bootsfahrten und Fotos im Wasser.',
      wenn: { aktiv: ['strand', 'boot'] } },

    /* ── Dokumente und Geld ────────────────────────────────── */
    { id: 'reisepass', kat: 'dokumente', text: 'Reisepass, gültig für die ganze Reise plus 6 Monate',
      tipp: 'Viele Länder verlangen sechs Monate Restgültigkeit ab Einreise. Rechtzeitig prüfen.',
      nur: { fern: ['ja'] } },
    { id: 'ausweis', kat: 'dokumente', text: 'Personalausweis oder Reisepass',
      tipp: 'Innerhalb von EU und Schengen reicht meist der Personalausweis.',
      nur: { fern: ['nein'] } },
    { id: 'kopien', kat: 'dokumente', text: 'Kopien aller Dokumente, digital und auf Papier',
      tipp: 'Alles Wichtige doppelt: einmal im Hauptrucksack, einmal im Daypack und einmal in der Cloud.' },
    { id: 'impfpass', kat: 'dokumente', text: 'Impfpass plus Kopie',
      tipp: 'Für Südamerika mit Gelbfieber-Eintrag, an einigen Grenzen wird er verlangt. Welche Impfungen du brauchst, klärt eine reisemedizinische Beratung.',
      wenn: { fern: ['ja'] } },
    { id: 'kreditkarten', kat: 'dokumente', text: '2 Kreditkarten ohne Auslandsgebühren',
      tipp: 'Getrennt aufbewahren. Die zweite Karte nie am selben Ort wie die erste. Klingt übervorsichtig, bis der Tag kommt, an dem du es brauchst.' },
    { id: 'bargeld', kat: 'dokumente', text: 'Notfall-Bargeld: {menge} USD in kleinen Scheinen',
      menge: { kurz: '100 bis 200', standard: '200 bis 300' },
      tipp: 'Für den Fall, dass kein Automat funktioniert oder eine Karte gesperrt wird. Dollar werden fast überall getauscht.',
      wenn: { fern: ['ja'] } },
    { id: 'versicherung', kat: 'dokumente', text: 'Auslandskrankenversicherung, Police als PDF',
      tipp: 'Die Notfallnummer der Versicherung gehört ins Handy und auf Papier.' },
    { id: 'fuehrerschein', kat: 'dokumente', text: 'Internationaler Führerschein',
      tipp: 'Brauchst du nur, wenn du ein Auto mieten willst. Wir sind im Norden Argentiniens mit dem Mietwagen gefahren.',
      wenn: { fern: ['ja'] } },
    { id: 'passfotos', kat: 'dokumente', text: 'Passfotos, 4 Stück',
      tipp: 'Für Visa und Permits, die du unterwegs beantragst.',
      nur: { fern: ['ja'], dauer: ['lang', 'sehrlang'] } },
    { id: 'tickets', kat: 'dokumente', text: 'Buchungen und Tickets offline gespeichert',
      tipp: 'Am Grenzübergang oder Flughafen ist das Internet oft genau dann weg, wenn du die Bestätigung brauchst.' },

    /* ── Gesundheit und Hygiene ────────────────────────────── */
    { id: 'apotheke', kat: 'gesundheit', text: 'Reiseapotheke: Schmerzmittel, Durchfallmittel, Elektrolyte, Pflaster',
      tipp: 'Gehört zu den wenigen Dingen, die du von zu Hause mitbringen solltest.' },
    { id: 'medikamente', kat: 'gesundheit', text: 'Persönliche Medikamente für die ganze Reise',
      tipp: 'In der Originalverpackung und mit Rezept oder ärztlicher Bescheinigung.' },
    { id: 'hoehe', kat: 'gesundheit', text: 'Mittel gegen Höhenkrankheit',
      tipp: 'Lass dich vorher ärztlich beraten. Das beste Mittel bleibt: langsam aufsteigen und viel trinken.',
      wenn: { klima: ['kalt'] } },
    { id: 'kulturbeutel', kat: 'gesundheit', text: 'Kulturbeutel: Zahnbürste, Zahnpasta, Deo, Rasierer',
      tipp: 'Reisegrößen reichen, nachkaufen kannst du überall.' },
    { id: 'sonnencreme', kat: 'gesundheit', text: 'Sonnencreme LSF 50',
      tipp: 'In der Höhe und am Äquator verbrennst du schneller, als du denkst.' },
    { id: 'muecken', kat: 'gesundheit', text: 'Mückenspray mit DEET',
      tipp: 'Vor allem in der Dämmerung. Im Dschungel zusätzlich lange Kleidung.',
      wenn: { klima: ['tropisch', 'regen'], aktiv: ['dschungel'] } },
    { id: 'festeshampoo', kat: 'gesundheit', text: 'Festes Shampoo und feste Seife',
      tipp: 'Keine Probleme mit der Flüssigkeitsregel im Handgepäck und nichts läuft aus.' },
    { id: 'handtuch', kat: 'gesundheit', text: 'Mikrofaser-Handtuch, groß',
      tipp: 'Viele Hostels verleihen Handtücher nur gegen Gebühr. Mikrofaser trocknet in einer Stunde.',
      wenn: { unterkunft: ['hostel', 'camping'], aktiv: ['strand'] } },
    { id: 'ohrstoepsel', kat: 'gesundheit', text: 'Ohrstöpsel und Schlafmaske',
      tipp: 'Für Schlafsäle, Nachtbusse und Hähne, die um vier Uhr krähen.' },
    { id: 'waescheleine', kat: 'gesundheit', text: 'Wäscheleine und Reisewaschmittel',
      tipp: 'Für die Wäsche zwischendurch im Waschbecken.',
      nur: { dauer: ['mittel', 'lang', 'sehrlang'] } },
    { id: 'wasserfilter', kat: 'gesundheit', text: 'Wasserflasche mit Filter',
      tipp: 'Spart Geld und Plastikflaschen, wo das Leitungswasser nicht trinkbar ist.' },
    { id: 'desinfektion', kat: 'gesundheit', text: 'Handdesinfektion und Taschentücher',
      tipp: 'Auf Busbahnhof-Toiletten fehlt beides fast immer.' },
    { id: 'periode', kat: 'gesundheit', text: 'Menstruationsprodukte, falls nötig',
      tipp: 'Unterwegs oft teuer oder nicht in deiner gewohnten Marke zu bekommen. Eine Menstruationstasse spart Platz.' },

    /* ── Sonstiges und Kleinkram ───────────────────────────── */
    { id: 'flickzeug', kat: 'sonstiges', text: 'Kleines Nähzeug, Gaffa-Tape und Kabelbinder',
      tipp: 'Repariert Rucksack, Schuhe und Zelt. Etwas Tape einfach um die Wasserflasche wickeln.',
      nur: { dauer: ['mittel', 'lang', 'sehrlang'] } },
    { id: 'brille', kat: 'sonstiges', text: 'Ersatzbrille oder Kontaktlinsen-Vorrat, falls nötig',
      tipp: 'Deine Sehstärke bekommst du unterwegs nicht überall.' },
    { id: 'sonnenbrille', kat: 'sonstiges', text: 'Sonnenbrille mit UV-Schutz',
      tipp: 'Auf Salzseen, Gletschern und in der Höhe unverzichtbar.' },
    { id: 'schnorchel', kat: 'sonstiges', text: 'Schnorchelmaske',
      tipp: 'Eine eigene Maske sitzt besser als die Leihmasken bei Touren.',
      wenn: { aktiv: ['strand'] } },
    { id: 'stoecke', kat: 'sonstiges', text: 'Trekkingstöcke',
      tipp: 'Für Mehrtagestouren. Kann man an vielen Startpunkten auch leihen.',
      nur: { aktiv: ['wandern'], dauer: ['lang', 'sehrlang'] } },
    { id: 'inlett', kat: 'sonstiges', text: 'Schlafsack-Inlett',
      tipp: 'Für einfache Unterkünfte, Camping und Nächte in Berghütten.',
      wenn: { unterkunft: ['camping'] } },
    { id: 'campingausruestung', kat: 'sonstiges', text: 'Zelt, Isomatte und Schlafsack (oder vor Ort leihen)',
      tipp: 'An vielen Nationalparks kannst du alles leihen. Das spart viel Gewicht.',
      wenn: { unterkunft: ['camping'] } },
    { id: 'moskitonetz', kat: 'sonstiges', text: 'Moskitonetz',
      tipp: 'Bei Lodges im Dschungel meist vorhanden, kurz nachfragen.',
      wenn: { aktiv: ['dschungel'] } },
    { id: 'karten', kat: 'sonstiges', text: 'Kartenspiel für Busfahrten und Hostelabende',
      tipp: 'Der schnellste Weg, im Hostel neue Leute kennenzulernen.' },
    { id: 'notizbuch', kat: 'sonstiges', text: 'Notizbuch und Kugelschreiber',
      tipp: 'Für Einreiseformulare, die du im Flugzeug ausfüllst, und für alles, was du nicht vergessen willst.' }
  ],

  VORLAGEN: [
    {
      key: 'suedamerika', icon: '🌎', label: 'Wie wir: 1 Jahr Südamerika', text: 'Handgepäck, vier Klimazonen, Hostels',
      antworten: {
        klima: ['tropisch', 'kalt', 'wueste', 'gemaessigt', 'regen'],
        dauer: ['sehrlang'], gepaeck: ['handgepaeck'], unterkunft: ['hostel', 'hotel'],
        aktiv: ['wandern', 'strand', 'dschungel', 'staedte', 'boot', 'filmen', 'drohne'], fern: ['ja']
      }
    },
    {
      key: 'strand', icon: '🏝️', label: '2 Wochen Strand und Sonne', text: 'Koffer, Hotel, Meer',
      antworten: {
        klima: ['tropisch'], dauer: ['mittel'], gepaeck: ['koffer'], unterkunft: ['hotel'],
        aktiv: ['strand', 'boot'], fern: ['ja']
      }
    },
    {
      key: 'staedte', icon: '🏙️', label: 'Städtetrip in Europa', text: 'Handgepäck, ein paar Tage',
      antworten: {
        klima: ['gemaessigt'], dauer: ['kurz'], gepaeck: ['handgepaeck'], unterkunft: ['hotel'],
        aktiv: ['staedte'], fern: ['nein']
      }
    }
  ]
};
