import { characterGenerator, generateTeam } from './generators';
import Bowman from './Types/bowman';
import Magician from './Types/magician';
import Swordsman from './Types/swordsman';
import Daemon from './Types/daemon';
import Undead from './Types/undead';
import Vampire from './Types/vampire';

/**
 * Genetates teams for user and AI.
 * @constructor
 * @param {string} lord - who is the master of the team.
 * @param {number} level - maximum characters level.
 * @param {number} count - size of the team.
 */
export default class Team {
  constructor(lord = 'ai', level = 1, count = 2) {
    if (lord !== 'ai') {
      this.typos = [Bowman, Magician, Swordsman];
      this.lordAi = false;
    } else {
      this.typos = [Daemon, Undead, Vampire];
      this.lordAi = true;
    }
    this.characters = generateTeam(this.typos, level, count);
  }

  /**
   * Adds random char to the team.
   * @param {number} level - maximum possible character level.
   */
  addChar(level) {
    this.characters.push(characterGenerator(this.typos, level).next().value);
  }
}
