import Character from '../Character';

export default class Vampire extends Character {
  constructor(name = 'Anonim', level = 1) {
    super(level, 'vampire', name);
    this.attack = 25;
    this.defence = 25;
    this.attackDistance = 2;
    this.moveDistance = 2;
  }
}
