/**
 * объект, который хранит текущее состояние игры (может сам себя воссоздавать из другого объекта)
 */
export default class GameState {
  constructor() {
    this.positions = [];
    this.occupiedPositions = new Set();
    this.playerMove = true;
    this.level = 1;
    //! cannot find any usability in counting and storing any points - they didnt show up anywhere
  }

  static from(object) {
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
