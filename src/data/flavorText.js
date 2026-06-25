export const WIN_ROASTS = [
  "CS achieved. 4 years of college to write Hello World in 6 languages. Worth it? 🎓",
  "You reached CS! Plot twist: it was mostly Stack Overflow and desperate prayer. 🙏",
  "CS UNLOCKED! Placements ✅  Sleep ❌  Social life: permanently deleted. 💀",
  "Civil se CS tak — this journey was more dramatic than your viva. Congrats. 🔥",
  "You are now qualified to be someone's unpaid intern. You earned this. 👑",
];

export const GAMEOVER_ROASTS = [
  "Board locked. Exactly like semester registration after fee pending. 🚫",
  "No moves left. Just like your career plan before 7th sem. 💀",
  "Even Civil branch is looking down at you right now. Try again. 😂",
  "Stuck from all sides — same energy as backlog form submission day. 📝",
  "Game over. Your CGPA and this board: both completely stuck. 📉",
];

// CS+CS final twist results shown on the win screen
export const PLACEMENT_RESULTS = [
  { title:"JOB OFFER! 🎉", desc:"TCS NQT cleared. Package: 3.5 LPA. Mom is finally proud. Aunties are next.", tone:"good" },
  { title:"GOOGLE REJECTED YOU 😂", desc:"'We regret to inform you...' Standard template. They didn't even read the resume. Apply to 200 more.", tone:"bad" },
  { title:"PACKAGE: 4.2 LPA 💰", desc:"Service-based company. 2 years bond. Bangalore relocation. Welcome to corporate life.", tone:"good" },
  { title:"GHOSTED BY RECRUITER 👻", desc:"3 interview rounds. HR said 'we'll get back to you.' That was 47 days ago. Still waiting.", tone:"bad" },
  { title:"OFFER LETTER RECEIVED 📄", desc:"Role: 'Software Engineer Trainee.' Actual role: testing legacy code nobody understands. Day 1 starts Monday.", tone:"good" },
  { title:"PLACEMENT CELL SAYS 'TRY NEXT YEAR' 🙃", desc:"CGPA cutoff missed by 0.03. The system doesn't care about your 2048 skills.", tone:"bad" },
];

// Random in-game "viva events" — fire every 25-40 moves, see src/game/events.js
export const COLLEGE_EVENTS = [
  {
    id:"attendance", title:"Attendance Shortage", icon:"⚠️",
    desc:"62% se neeche gaya. Tile demoted.",
    effect:"attendance", tone:"bad",
  },
  {
    id:"internal", title:"Internal Marks Added", icon:"⭐",
    desc:"Class participation bonus. One tile promoted.",
    effect:"internal", tone:"good",
  },
  {
    id:"lab", title:"Lab Submitted", icon:"📄",
    desc:"Practical file accepted. +100 score.",
    effect:"lab", tone:"good",
  },
  {
    id:"faculty", title:"New Faculty Assigned", icon:"😵",
    desc:"Mid-sem change. Board reshuffled.",
    effect:"faculty", tone:"shuffle",
  },
  {
    id:"placement", title:"Placement Cell Workshop", icon:"💼",
    desc:"Attendance counts. Free tile dropped.",
    effect:"placement", tone:"good",
  },
];
