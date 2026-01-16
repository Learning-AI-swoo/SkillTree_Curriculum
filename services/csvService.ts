import { Course } from "../types";

export const parseCSV = (csvText: string): Course[] => {
  const lines = csvText.trim().split(/\r?\n/);
  const courses: Course[] = [];

  // Skip header if it exists (heuristic: check if first line contains "id" or "code")
  let startIndex = 0;
  if (lines.length > 0 && lines[0].toLowerCase().includes("code")) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Simple CSV split handling commas inside quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Fallback split if regex fails or simple structure
    const columns = line.split(",").map(col => col.trim().replace(/^"|"$/g, ''));

    if (columns.length >= 2) {
      const id = columns[0];
      const title = columns[1];
      
      // Column 3: Prerequisites (semicolon separated)
      const prereqsRaw = columns[2] || "";
      const prerequisites = prereqsRaw ? prereqsRaw.split(";").map(p => p.trim()).filter(Boolean) : [];

      // Column 4: Category
      const category = columns[3] || "General";

      // Column 5: Description
      const description = columns[4] || "";

      courses.push({
        id,
        title,
        prerequisites,
        category,
        description
      });
    }
  }

  return courses;
};

export const EXAMPLE_CSV = `Course Code, Title, Prerequisites (separated by ;), Category, Description
ADV100, Novice Adventuring, , Basics, Introduction to the world.
MAG100, Mana Control, ADV100, Magic, Learn to harness inner energy.
SWD100, Sword Basics, ADV100, Combat, Pointy end goes into the other guy.
REQ_BASICS, Basic Training Complete, , Milestone, Check this box when you have finished ANY 2 basic courses.
MAG200, Fireball Casting, MAG100; REQ_BASICS, Magic, Create and throw balls of fire.
SWD200, Dual Wielding, SWD100; REQ_BASICS, Combat, Fighting with two weapons.
ULT300, Spellblade Mastery, MAG200; SWD200, Ultimate, Combine magic and steel.`;
