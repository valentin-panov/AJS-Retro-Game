import Character from '../Character';

export default class Undead extends Character {
  constructor(name = 'Anonim', level = 1) {
    super(level, 'undead', name);
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
  }
}
