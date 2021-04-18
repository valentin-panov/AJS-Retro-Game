import Character from '../Character';

export default class Undead extends Character {
  constructor(args) {
    super({
      ...args,
      attack: 40,
      defence: 10,
      attackDistance: 1,
      moveDistance: 4,
      type: 'undead',
      lordAi: true,
    });
  }
}
