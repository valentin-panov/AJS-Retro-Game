import Character from '../Character';

export default class Daemon extends Character {
  constructor(name = 'Anonim', level = 1) {
    super(level, 'daemon', name);
    this.attack = 10;
    this.defence = 40;
    this.attackDistance = 4;
    this.moveDistance = 1;
  }
}
