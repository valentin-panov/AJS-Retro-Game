/**
 * объект, который хранит текущее состояние игры (может сам себя воссоздавать из другого объекта)
 */
export default class GameState {
  constructor() {
    this.teamAi = [];
    this.teamUser = [];
    this.positions = [];
    this.selectedCell = null;
    this.selectedChar = null;
    this.occupiedPositions = new Set();
    this.playerMove = true;
  }

  static from(object) {
    // TODO: create object
    return null;
  }
}
