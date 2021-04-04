import { characterGenerator, generateTeam } from './generators';
import Bowman from './Types/bowman';
import Magician from './Types/magician';
import Swordsman from './Types/swordsman';
import Daemon from './Types/daemon';
import Undead from './Types/undead';
import Vampire from './Types/vampire';

export default class Team {
  constructor(lord = 'ai', level = 1, count = 2) {
    if (lord !== 'ai') {
      this.typos = [Bowman, Magician, Swordsman];
    } else {
      this.typos = [Daemon, Undead, Vampire];
    }
    this.characters = generateTeam(this.typos, level, count);
  }

  addChar(level) {
    this.characters.push(characterGenerator(this.typos, level).next().value);
  }
}
