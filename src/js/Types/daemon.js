import Character from '../Character';

export default class Daemon extends Character {
  constructor(name) {
    super(name, 'daemon');
    this.attack = 10;
    this.defence = 40;
    this.attackDistance = 4;
    this.moveDistance = 1;
  }
}
