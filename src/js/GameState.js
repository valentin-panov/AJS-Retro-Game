/**
 * объект, который хранит текущее состояние игры (может сам себя воссоздавать из другого объекта)
 * @var {Array} this.positions - array of positioned characters
 * @var {Set} this.occupiedPositions - set of occupied positions, for ease positioning process
 * @var {boolean} this.playerMove - who is moving now. Need for AI moves logic.
 * @var {number} this.level - actual game level
 * @var {number} this.userStats - user points, aquired with victories
 */
export default class GameState {
  constructor() {
    this.positions = [];
    this.occupiedPositions = new Set();
    this.playerMove = true;
    this.level = 1;
    this.userStats = 0;
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
