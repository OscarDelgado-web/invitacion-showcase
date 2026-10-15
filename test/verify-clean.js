const fs = require('fs');

const files = [
  'index.html',
  'script.js',
  'styles.css',
  'i18n.js',
  'api/rsvp.js'
];

const patterns = [
  { name: 'email', regex: /email/i },
  { name: 'correo', regex: /correo/i },
  { name: 'notes', regex: /notes/i }
];

let totalMatches = 0;

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.warn(`File not found: ${file}`);
    return;
  }
  const content = fs.readFileSync(file, 'utf8');
  patterns.forEach(pat => {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (pat.regex.test(line)) {
        console.error(`[MATCH] ${file}:${index + 1} (${pat.name}) -> ${line.trim()}`);
        totalMatches++;
      }
    });
  });
});

if (totalMatches === 0) {
  console.log('PERFECT: 0 occurrences of email, correo, notes in all target files!');
  process.exit(0);
} else {
  console.error(`FAILED: ${totalMatches} occurrences found.`);
  process.exit(1);
}
