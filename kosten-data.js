/* ============================================================
   KOSTEN-DATA.JS: Einzige Quelle fuer alle Reisekosten
   ------------------------------------------------------------
   Wird gelesen von:
     - den Laenderseiten (Kosten-Karte mit Donut)
     - index.html (Gesamtausgaben nach Land)
     - kosten.html (Laendervergleich)

   Alle Betraege in Euro PRO PERSON. Die Auslandskrankenversicherung
   ist nicht enthalten.

   Neues Land abrechnen: einen Eintrag ergaenzen (Reihenfolge wie
   auf der Reise). Die Seiten rechnen Summen, Tagesschnitt und
   Anteile selbst aus.

   variants: verschiedene Sichten auf dasselbe Land, umschaltbar
   auf der Laenderseite ueber Knoepfe mit data-variant="<key>".
   defaultKey ist die Sicht, die in Gesamtsumme und Vergleich
   zaehlt.
     zeitraum    Text fuer die Anzeige
     tage        Anzahl Tage (Basis fuer "pro Tag")
     gesamt      Summe (muss zur Summe der Kategorien passen)
     kategorien  activities | accommodation | food |
                 transportation | others

   hinweis: optionaler Zusatz fuer kosten.html, z.B. was in der
   Standard-Sicht enthalten ist.

   WICHTIG: keine Em-Dashes in Texten (Projekt-Stil).
   ============================================================ */

window.KOSTEN = [
  {
    slug: 'kolumbien',
    name: 'Kolumbien',
    color: '#2a78d6',
    defaultKey: 'gesamt',
    variants: {
      gesamt: {
        zeitraum: '25.02. bis 17.04.2026',
        tage: 52,
        gesamt: 2856.97,
        kategorien: { activities: 809.06, accommodation: 784.97, food: 761.56, transportation: 385.79, others: 115.05 }
      }
    }
  },
  {
    slug: 'ecuador',
    name: 'Ecuador',
    color: '#eb6834',
    defaultKey: 'mit',
    hinweis: 'inklusive Galápagos',
    variants: {
      mit: {
        zeitraum: '17.04. bis 31.05.2026',
        tage: 44,
        gesamt: 3398.47,
        kategorien: { activities: 1142.60, accommodation: 611.70, food: 689.79, transportation: 708.81, others: 244.95 }
      },
      ohne: {
        zeitraum: '17.04. bis 08.05. und 27. bis 31.05.2026',
        tage: 25,
        gesamt: 1647.82,
        kategorien: { activities: 653.79, accommodation: 372.17, food: 286.30, transportation: 290.61, others: 44.95 }
      },
      nur: {
        zeitraum: '08.05. bis 27.05.2026',
        tage: 19,
        gesamt: 1750.65,
        kategorien: { activities: 488.81, accommodation: 239.53, food: 403.49, transportation: 418.20, others: 200 }
      }
    }
  },
  {
    slug: 'peru',
    name: 'Peru',
    color: '#1baf7a',
    defaultKey: 'gesamt',
    variants: {
      gesamt: {
        zeitraum: '01.06. bis 07.08.2026',
        tage: 67,
        gesamt: 2874.19,
        kategorien: { activities: 560.13, accommodation: 766.84, food: 1033.09, transportation: 411.89, others: 102.24 }
      }
    }
  },
  {
    slug: 'bolivien',
    name: 'Bolivien',
    color: '#eda100',
    defaultKey: 'gesamt',
    variants: {
      gesamt: {
        zeitraum: '07.08. bis 04.09.2026',
        tage: 29,
        gesamt: 886.15,
        kategorien: { activities: 329.79, accommodation: 266.37, food: 232.63, transportation: 41.46, others: 15.90 }
      }
    }
  },
  {
    // Mit = Julias Weg (inkl. Osterinsel), Ohne = Sergens Weg (inkl. Santiago 15. bis 22.10.)
    slug: 'chile',
    name: 'Chile',
    color: '#7c5cc4',
    defaultKey: 'mit',
    hinweis: 'inklusive Osterinsel',
    variants: {
      mit: {
        zeitraum: '04. bis 08.09. und 03.10. bis 09.11.2026',
        tage: 41,
        gesamt: 2933.15,
        kategorien: { activities: 623.59, accommodation: 746.57, food: 567.26, transportation: 945.31, others: 50.42 }
      },
      ohne: {
        zeitraum: '04. bis 08.09. und 03.10. bis 09.11.2026',
        tage: 41,
        gesamt: 1781.20,
        kategorien: { activities: 313.83, accommodation: 652.60, food: 470.78, transportation: 316.98, others: 27.01 }
      },
      nur: {
        zeitraum: '15. bis 22.10.2026',
        tage: 7,
        gesamt: 1300.96,
        kategorien: { activities: 309.76, accommodation: 189.98, food: 131.63, transportation: 646.18, others: 23.41 }
      }
    }
  }
];
