const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../Complete_bootcamp003_members_EN');
const jaPath = path.join(__dirname, '../Complete_bootcamp003_participants.json');
const outPath = path.join(__dirname, '../src/data/people.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8')).participants;
const ja = JSON.parse(fs.readFileSync(jaPath, 'utf-8')).participants;

// Build a map of Japanese participants by github_account for fast lookup
const jaMap = {};
ja.forEach(p => {
  if (p.github_account) jaMap[p.github_account] = p;
});

// Team color palette
const palette = [
  '#1E88E5', '#43A047', '#F4511E', '#8E24AA', '#FDD835', '#00ACC1', '#D81B60', '#3949AB', '#FB8C00', '#00897B', '#C0CA33', '#5E35B1', '#F06292', '#7CB342', '#FFB300', '#039BE5', '#E53935', '#757575'
];
const teamColorMap = {};
let colorIdx = 0;

function getTeamColor(team) {
  if (!team) return '#808080';
  if (!teamColorMap[team]) {
    teamColorMap[team] = palette[colorIdx % palette.length];
    colorIdx++;
  }
  return teamColorMap[team];
}

function getInitials(name) {
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const people = en.map((p, idx) => {
  const jaP = jaMap[p.github_account] || {};
  return {
    id: idx + 1,
    name_en: p.name || '',
    name_ja: jaP.name || '',
    role_en: p.role || '',
    role_ja: jaP.role || '',
    avatar_initials: getInitials(p.name),
    avatar_color: getTeamColor(p.team),
    profile_url_en: p.profile_url || '',
    profile_url_ja: jaP.profile_url || '',
    github_account: p.github_account || '',
    team_en: p.team || '',
    team_ja: jaP.team || '',
    specialty_en: p.specialty || '',
    specialty_ja: jaP.specialty || '',
    ideas_en: p.ideas || '',
    ideas_ja: jaP.ideas || '',
    interests_en: p.interests || '',
    interests_ja: jaP.interests || '',
    concurrent_possible: p.concurrent_possible !== undefined ? p.concurrent_possible : jaP.concurrent_possible,
    rocket_incubator: p.rocket_incubator !== undefined ? p.rocket_incubator : jaP.rocket_incubator,
    graphai_ai_podcaster: p.graphai_ai_podcaster !== undefined ? p.graphai_ai_podcaster : jaP.graphai_ai_podcaster,
    // Skills and hobbies as language-specific arrays
    skills_en: p.specialty ? p.specialty.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    skills_ja: jaP.specialty ? jaP.specialty.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    hobbies_en: p.interests ? p.interests.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    hobbies_ja: jaP.interests ? jaP.interests.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    recentActivity_en: p.ideas || p.specialty || '',
    recentActivity_ja: jaP.ideas || jaP.specialty || '',
  };
});

fs.writeFileSync(outPath, JSON.stringify(people, null, 2), 'utf-8');
console.log(`Wrote ${people.length} people to ${outPath}`); 