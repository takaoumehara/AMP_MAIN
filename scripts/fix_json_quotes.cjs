//!/usr/bin/env node
// Node.js script to fix unescaped double quotes in Japanese string values in people_gemini.json
// Run this script with: node scripts/fix_json_quotes.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/people_gemini.json');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to match: "ja": "..."
// This will find all ja fields and their string values
content = content.replace(/("ja"\s*:\s*")((?:[^"\\]|\\.)*)(")/g, (match, p1, p2, p3) => {
  // Escape unescaped double quotes inside the value
  // Only escape quotes that are not already escaped
  const fixed = p2.replace(/([^\\])"/g, '$1\\"');
  return p1 + fixed + p3;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed unescaped double quotes in Japanese string values.'); 