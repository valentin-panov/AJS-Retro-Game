import Character from '../Character';

export default class Daemon extends Character {
  constructor(args) {
    super({
      ...args,
      attack: 10,
      defence: 40,
      attackDistance: 4,
      moveDistance: 1,
      type: 'daemon',
      lordAi: true,
    });
  }
}
