import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/data/people_gemini_fixed.json');
const outputPath = path.join(__dirname, '../src/data/people_gemini_fixed.csv');

const json = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const people = json.participants;

const headers = [
  'id',
  'name_ja',
  'name_en',
  'profile_url',
  'github_account',
  'team_ja',
  'team_en',
  'roles_ja',
  'roles_en',
  'specialties_ja',
  'specialties_en',
  'ideas_ja',
  'ideas_en',
  'interests_ja',
  'interests_en',
  'summary_ja',
  'summary_en',
  'project_details_ja',
  'project_details_en',
];

function arrToStr(arr, key) {
  if (!Array.isArray(arr)) return '';
  return arr.map(item => (item && item[key]) ? item[key] : '').filter(Boolean).join(', ');
}

function getField(obj, key) {
  return obj && obj[key] ? obj[key] : '';
}

const rows = [headers.join(',')];

for (const p of people) {
  const row = [
    p.id || '',
    getField(p.name, 'ja'),
    getField(p.name, 'en'),
    p.profile_url || '',
    p.github_account || '',
    getField(p.team, 'ja'),
    getField(p.team, 'en'),
    arrToStr(p.role, 'ja'),
    arrToStr(p.role, 'en'),
    arrToStr(p.specialty, 'ja'),
    arrToStr(p.specialty, 'en'),
    arrToStr(p.ideas, 'ja'),
    arrToStr(p.ideas, 'en'),
    arrToStr(p.interests, 'ja'),
    arrToStr(p.interests, 'en'),
    getField(p.summary, 'ja'),
    getField(p.summary, 'en'),
    getField(p.project_details, 'ja'),
    getField(p.project_details, 'en'),
  ].map(v => {
    if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))) {
      return '"' + v.replace(/"/g, '""') + '"';
    }
    return v;
  });
  rows.push(row.join(','));
}

fs.writeFileSync(outputPath, rows.join('\n'), 'utf-8');
console.log('CSV file created at', outputPath); 