import Character from '../Character';

export default class Swordsman extends Character {
  constructor(...args) {
    super('swordsman', ...args);
    this.attack = 40;
    this.defence = 10;
    this.attackDistance = 1;
    this.moveDistance = 4;
  }
}
