import Character from '../Character';

export default class Undead extends Character {
  constructor(name) {
    super(name, 'undead');
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
  }
}
