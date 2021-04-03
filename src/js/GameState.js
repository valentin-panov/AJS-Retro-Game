/**
 * объект, который хранит текущее состояние игры (может сам себя воссоздавать из другого объекта)
 */
export default class GameState {
  constructor() {
    this.positions = [];
    this.occupiedPositions = new Set();
    this.playerMove = true;
    this.level = 1;
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
