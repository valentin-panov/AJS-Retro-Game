import Character from '../Character';

export default class Daemon extends Character {
  constructor(...args) {
    super('daemon', ...args);
    this.attack = 10;
    this.defence = 40;
    this.attackDistance = 4;
    this.moveDistance = 1;
  }
}
