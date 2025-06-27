const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../Complete_bootcamp003_participants.json');
const outputPath = path.join(__dirname, '../src/data/people.json');

const raw = fs.readFileSync(inputPath, 'utf-8');
const data = JSON.parse(raw);
const participants = data.participants;

const people = participants.map((p, idx) => {
  const name = p.name;
  return {
    id: idx + 1,
    name,
    role: p.role || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    skills: p.specialty ? p.specialty.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    hobbies: p.interests ? p.interests.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : [],
    recentActivity: p.ideas || p.specialty || '',
    profile_url: p.profile_url || '',
    github_account: p.github_account || '',
    team: p.team || '',
    specialty: p.specialty || '',
    ideas: p.ideas || '',
    interests: p.interests || '',
    concurrent_possible: p.concurrent_possible,
    rocket_incubator: p.rocket_incubator,
    graphai_ai_podcaster: p.graphai_ai_podcaster
  };
});

fs.writeFileSync(outputPath, JSON.stringify(people, null, 2), 'utf-8');
console.log(`Wrote ${people.length} people to ${outputPath}`); 