import Character from '../Character';

export default class Bowman extends Character {
  constructor(args) {
    super({
      ...args,
      attack: 25,
      defence: 25,
      attackDistance: 2,
      moveDistance: 2,
      type: 'bowman',
      lordAi: false,
    });
  }
}
