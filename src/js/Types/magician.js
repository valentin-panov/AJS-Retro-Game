import Character from '../Character';

export default class Magician extends Character {
  constructor(name) {
    super(name, 'magician');
    this.attack = 10;
    this.defence = 40;
    this.attackDistance = 4;
    this.moveDistance = 1;
  }
}
