/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 *
 */

export function* characterGenerator(allowedTypes, maxLevel) {
  const level = Math.floor(1 + Math.random() * maxLevel);
  const type = Math.floor(0 + Math.random() * allowedTypes.length);
  yield new allowedTypes[type]({ level });
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    const char = characterGenerator(allowedTypes, maxLevel).next().value;
    // increase char stats according its level
    if (char.level !== 1) {
      for (let j = 1; j < char.level; j += 1) {
        char.levelUp();
        char.health = 50;
        char.level -= 1;
      }
    }
    team.push(char);
  }
  return team;
}
