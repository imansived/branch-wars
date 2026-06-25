export const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// Indian-style digit grouping (e.g. 1,02,400) to match the college theme
export const fmtNum = n => n.toLocaleString("en-IN");
