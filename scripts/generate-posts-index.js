// Netlify Build Script: Scannt /posts/*.md und schreibt posts/index.json
// Wird automatisch bei jedem Netlify-Deploy ausgeführt.

const fs   = require('fs');
const path = require('path');

const postsDir  = path.join(__dirname, '..', 'posts');
const indexFile = path.join(postsDir, 'index.json');

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse(); // Neueste zuerst (YYYY-MM-DD Präfix)

fs.writeFileSync(indexFile, JSON.stringify(files, null, 2), 'utf8');
console.log(`[generate-posts-index] ${files.length} Post(s) gefunden → posts/index.json aktualisiert`);
files.forEach(f => console.log(`  · ${f}`));
