// ═══════════════════════════════════════════════════════════════════
//  REISE-KONFIGURATION — Nur hier ändern, alles andere passiert automatisch
// ═══════════════════════════════════════════════════════════════════

const REISE = {

  // ── Reise-Start ────────────────────────────────────────────────
  startDatum: new Date('2026-02-25'),

  // ── Persönliche Länder-Bilanz (Lifetime, inkl. vor der Reise) ──
  sergenLaender: 14,
  juliaLaender:  47,

  // ── Reise-Zahlen ───────────────────────────────────────────────
  kmZurueckgelegt:      13500,
  vlogsVeroeffentlicht: 6,

  // ── YouTube-Stats (manuell aktualisieren) ──────────────────────
  stundenVideomaterial: 1,      // ✏️ Stunden Videomaterial gesamt
  aufrufeGesamt:        12595,   // ✏️ Aufrufe gesamt (YouTube Analytics)
  abonnenten:           87,     // ✏️ Abonnenten

  // ── Südamerika-Reise: Status pro Land ──────────────────────────
  // Status: 'visited' = war dort | 'current' = gerade dort | '' = noch geplant
  // → Neues Land bereist? Status auf 'visited' setzen, fertig.
  suedamerika: [
    { name: 'Kolumbien',      iso: 170, status: 'visited', href: 'laender.html#kolumbien' },
    { name: 'Ecuador',        iso: 218, status: 'visited', href: 'laender.html#ecuador'   },
    { name: 'Peru',           iso: 604, status: 'current', href: 'laender.html#peru'      },
    { name: 'Bolivien',       iso:  68, status: '',        href: 'laender.html#geplant'   },
    { name: 'Chile',          iso: 152, status: '',        href: 'laender.html#geplant'   },
    { name: 'Argentinien',    iso:  32, status: '',        href: 'laender.html#geplant'   },
    { name: 'Brasilien',      iso:  76, status: '',        href: 'laender.html#geplant'   },
    { name: 'Venezuela',      iso: 862, status: '',        href: 'laender.html#geplant'   },
    { name: 'Uruguay',        iso: 858, status: '',        href: 'laender.html#geplant'   },
    { name: 'Paraguay',       iso: 600, status: '',        href: 'laender.html#geplant'   },
    { name: 'Guyana',         iso: 328, status: '',        href: '#'                      },
    { name: 'Suriname',       iso: 740, status: '',        href: '#'                      },
    { name: 'Franz. Guayana', iso: 254, status: '',        href: '#'                      },
  ],
};

// ── Automatisch berechnete Werte ────────────────────────────────
REISE.laenderBereist = REISE.suedamerika.filter(l => l.status === 'visited' || l.status === 'current').length;
REISE.tageDrausweg   = Math.floor((new Date() - REISE.startDatum) / 86400000);

// ISO-Map für die Südamerika-Karte (index.html)
REISE.saMap = {};
REISE.suedamerika.forEach(l => { REISE.saMap[l.iso] = l; });

// ── DOM automatisch befüllen (alle Seiten) ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Elemente mit data-reise="feldName" bekommen data-count gesetzt
  // → der bestehende Counter-Animator in main.js zählt sie hoch
  document.querySelectorAll('[data-reise]').forEach(el => {
    const val = REISE[el.dataset.reise];
    if (val !== undefined) {
      el.setAttribute('data-count', val);
      el.textContent = '0';
    }
  });
});
