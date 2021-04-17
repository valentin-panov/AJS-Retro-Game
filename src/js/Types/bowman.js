import Character from '../Character';

export default class Bowman extends Character {
  constructor(...args) {
    super('bowman', ...args);
    this.attack = 25;
    this.defence = 25;
    this.attackDistance = 2;
    this.moveDistance = 2;
  }
}
