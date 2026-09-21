// ═══════════════════════════════════════════════════════════════════
//  REISE-KONFIGURATION: Nur hier ändern, alles andere passiert automatisch
// ═══════════════════════════════════════════════════════════════════
const REISE = {
  // ── Reise-Start ────────────────────────────────────────────────
  startDatum: new Date('2026-02-25'),
  // ── Persönliche Länder-Bilanz (Lifetime, inkl. vor der Reise) ──
  sergenLaender: 17,
  juliaLaender:  50,
// ── Reise-Zahlen ───────────────────────────────────────────────
  kmZurueckgelegt:      14800,
  // ── Orte besucht (Pins auf karte.html, Status visited + current) ─
  orteBesucht:          39,  // ✏️ hier anpassen, wenn neue Orte/Pins dazukommen
  // ── Nächste Woche / Aktueller Ausblick ─────────────────────────
  naechsteWoche: 'Übermorgen ziehen wir von Córdoba weiter nach Rosario, der Stadt am Río Paraná. Wir sind gespannt, was uns dort erwartet 🙌',  // ✏️ hier anpassen
  // ── Aktueller Standort (Stadt-Ebene, fuer die Live-Reisestatus-Box) ─
  standort: 'Córdoba, Argentinien',  // ✏️ hier anpassen
  // ── Südamerika-Reise: Status pro Land ──────────────────────────
  suedamerika: [
    { name: 'Kolumbien',      iso: 170, status: 'visited', href: 'kolumbien.html'         },
    { name: 'Ecuador',        iso: 218, status: 'visited', href: 'ecuador.html'           },
    { name: 'Peru',           iso: 604, status: 'visited', href: 'peru.html'              },
    { name: 'Bolivien',       iso:  68, status: 'visited', href: 'bolivien.html'          },
    { name: 'Chile',          iso: 152, status: 'visited', href: 'chile.html'             },
    { name: 'Argentinien',    iso:  32, status: 'current', href: 'argentinien.html'       },
    { name: 'Brasilien',      iso:  76, status: '',        href: 'laender.html#geplant'   },
    { name: 'Venezuela',      iso: 862, status: '',        href: '#'                      },
    { name: 'Uruguay',        iso: 858, status: '',        href: 'laender.html#geplant'   },
    { name: 'Paraguay',       iso: 600, status: '',        href: 'laender.html#geplant'   },
    { name: 'Guyana',         iso: 328, status: '',        href: '#'                      },
    { name: 'Suriname',       iso: 740, status: '',        href: '#'                      },
    { name: 'Franz. Guayana', iso: 254, status: '',        href: '#'                      },
  ],
};
// ── Länder-Status aus laender-config.js übernehmen ──────────────
// laender-config.js (status: bereist | aktuell | geplant) ist die einzige
// Quelle. Die status-Werte oben sind nur der Fallback für Seiten, die
// laender-config.js nicht laden. So zeigen Zähler, Karte und Chips immer
// dieselbe Zahl. Auf Seiten mit beiden Skripten muss laender-config.js VOR
// reise-config.js eingebunden sein.
if (window.LAENDER) {
  const STATUS_MAP = { bereist: 'visited', aktuell: 'current', geplant: '' };
  REISE.suedamerika.forEach(l => {
    const eintrag = window.LAENDER.find(x => x.name === l.name);
    if (eintrag) l.status = STATUS_MAP[eintrag.status];
  });
}
// ── Automatisch berechnete Werte ────────────────────────────────
REISE.laenderBereist =REISE.suedamerika.filter(l => l.status === 'visited' || l.status === 'current').length;
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
  // Zahlen mitten im Fließtext (kein Zähler-Effekt)
  document.querySelectorAll('[data-reise-text]').forEach(el => {
    const val = REISE[el.dataset.reiseText];
    if (val !== undefined) el.textContent = val;
  });
  // Nächste-Woche-Box befüllen
  const naechsteWocheEl = document.getElementById('naechste-woche-text');
  if (naechsteWocheEl) naechsteWocheEl.textContent = REISE.naechsteWoche;
  // Aktueller-Standort-Text befüllen
  const standortEl = document.getElementById('reise-standort-text');
  if (standortEl) standortEl.textContent = REISE.standort;
});
