import Character from '../Character';

export default class Swordsman extends Character {
  constructor(args) {
    super({
      ...args,
      attack: 40,
      defence: 10,
      attackDistance: 1,
      moveDistance: 4,
      type: 'swordsman',
      lordAi: false,
    });
  }
}
