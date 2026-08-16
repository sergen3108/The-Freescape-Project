// ═══════════════════════════════════════════════════════════════════
//  REISE-KONFIGURATION: Nur hier ändern, alles andere passiert automatisch
// ═══════════════════════════════════════════════════════════════════
const REISE = {
  // ── Reise-Start ────────────────────────────────────────────────
  startDatum: new Date('2026-02-25'),
  // ── Persönliche Länder-Bilanz (Lifetime, inkl. vor der Reise) ──
  sergenLaender: 15,
  juliaLaender:  48,
// ── Reise-Zahlen ───────────────────────────────────────────────
  kmZurueckgelegt:      14300,
  // ── Orte besucht (Pins auf karte.html, Status visited + current) ─
  orteBesucht:          36,  // ✏️ hier anpassen, wenn neue Orte/Pins dazukommen
  // ── Nächste Woche / Aktueller Ausblick ─────────────────────────
  naechsteWoche: 'Von Sucre geht es als nächstes weiter zum Salar de Uyuni, dem größten Salzsee der Erde! Wir sind gespannt 🙌',  // ✏️ hier anpassen
  // ── Aktueller Standort (Stadt-Ebene, fuer die Live-Reisestatus-Box) ─
  standort: 'Sucre, Bolivien',  // ✏️ hier anpassen
  // ── Südamerika-Reise: Status pro Land ──────────────────────────
  suedamerika: [
    { name: 'Kolumbien',      iso: 170, status: 'visited', href: 'kolumbien.html'         },
    { name: 'Ecuador',        iso: 218, status: 'visited', href: 'ecuador.html'           },
    { name: 'Peru',           iso: 604, status: 'visited', href: 'peru.html'              },
    { name: 'Bolivien',       iso:  68, status: 'current', href: 'bolivien.html'          },
    { name: 'Chile',          iso: 152, status: '',        href: 'laender.html#geplant'   },
    { name: 'Argentinien',    iso:  32, status: '',        href: 'laender.html#geplant'   },
    { name: 'Brasilien',      iso:  76, status: '',        href: 'laender.html#geplant'   },
    { name: 'Venezuela',      iso: 862, status: '',        href: '#'                      },
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
  document.querySelectorAll('[data-reise]').forEach(el => {
    const val = REISE[el.dataset.reise];
    if (val !== undefined) {
      el.setAttribute('data-count', val);
      el.textContent = '0';
    }
  });
  // Nächste-Woche-Box befüllen
  const naechsteWocheEl = document.getElementById('naechste-woche-text');
  if (naechsteWocheEl) naechsteWocheEl.textContent = REISE.naechsteWoche;
  // Aktueller-Standort-Text befüllen
  const standortEl = document.getElementById('reise-standort-text');
  if (standortEl) standortEl.textContent = REISE.standort;
});
