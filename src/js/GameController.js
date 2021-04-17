/* eslint-disable no-alert */
import themes from './themes';
import cursors from './cursors';
import GamePlay from './GamePlay';
import GameState from './GameState';
import Team from './Team';
import Character from './Character';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay || new GamePlay();
    this.stateService = stateService;
    this.gameState = new GameState();

    // Get all defined class methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    // Bind all methods
    methods
      .filter((method) => method !== 'constructor')
      .forEach((method) => {
        this[method] = this[method].bind(this);
      });
  }

  /**
   * Initialises game essentials.
   * @this  {gameState}
   * @see {number} this.gameState.level - actual level.
   * @see {Array} this.gameState.positions - array of positioned characters.
   */
  init() {
    this.teamsInit(this.gameState.level);
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.addGameListeners();
    this.addCellListeners();
    if (this.stateService.load()) {
      // eslint-disable-next-line no-restricted-globals
      const result = confirm('Загрузить игру из сохранения?');
      if (result) {
        this.loadGame();
      }
    }
  }

  addGameListeners() {
    this.gamePlay.addNewGameListener(this.newGame);
    this.gamePlay.addSaveGameListener(this.saveGame);
    if (this.stateService.load()) {
      this.gamePlay.addLoadGameListener(this.loadGame);
    }
  }

  removeGameListeners() {
    // ! "Это странный хак." - а как иначе? я не смог разобраться (
    this.gamePlay.newGameListeners.length = 0;
    this.gamePlay.saveGameListeners.length = 0;
    this.gamePlay.loadGameListeners.length = 0;
  }

  addCellListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
  }

  removeCellListeners() {
    this.gamePlay.cellEnterListeners.length = 0;
    this.gamePlay.cellLeaveListeners.length = 0;
    this.gamePlay.cellClickListeners.length = 0;
  }

  newGame() {
    this.removeGameListeners();
    this.removeCellListeners();
    this.gameState = new GameState();
    this.selectedChar = null;
    this.selectedCell = null;
    this.teamsInit(this.gameState.level);
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
    GamePlay.showMessage('Новая игра');
    this.addGameListeners();
    this.addCellListeners();
  }

  saveGame() {
    this.removeGameListeners();
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Игра сохранена');
    this.addGameListeners();
  }

  loadGame() {
    this.removeCellListeners();
    this.removeGameListeners();

    let loadState = null;
    try {
      loadState = this.stateService.load();
    } catch (err) {
      GamePlay.message('Load game error:', err);
      return;
    }

    this.gameState = new GameState();
    this.gameState.level = loadState.level;
    this.selectedChar = null;
    this.selectedCell = null;
    this.teamAi.characters.length = 0;
    this.teamUser.characters.length = 0;
    this.gameState.positions = loadState.positions;
    loadState.positions.forEach((item) => {
      this.gameState.occupiedPositions.add(item.position);
      Object.setPrototypeOf(item.character, Character.prototype);
      // eslint-disable-next-line no-unused-expressions
      item.character.lordAi
        ? this.teamAi.characters.push(item.character)
        : this.teamUser.characters.push(item.character);
    });
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
    GamePlay.showMessage('Игра загружена');
    this.addCellListeners();
    this.addGameListeners();
  }

  /**
   * Genetates teams for user and AI.
   *
   * @this  {gameState}
   * @param {number} level - actual game level.
   * @see {this.teamUser.addChar} @param {number} - adds a char to the team with this maximum possible level
   */
  teamsInit(level) {
    // generate user team
    switch (level) {
      case 1:
        this.teamUser = new Team('User');
        break;
      case 2:
        this.teamUser.addChar(1);
        break;
      case 3:
        this.teamUser.addChar(2);
        this.teamUser.addChar(2);
        break;
      case 4:
        this.teamUser.addChar(3);
        this.teamUser.addChar(3);
        break;
      default:
        break;
    }

    // spread user chars
    this.spreadTheTeam(this.teamUser);

    // generate AI team
    this.teamAi = new Team('ai', level, this.teamUser.characters.length);

    // spread AI chars
    this.spreadTheTeam(this.teamAi);
  }

  spreadTheTeam(team) {
    let position = null;
    const { boardSize } = this.gamePlay;
    const possibleField = 2; // width of the team column
    const side = team.lordAi ? boardSize - possibleField : 0;
    for (const char of team.characters) {
      do {
        position =
          Math.floor(Math.random() * boardSize) * boardSize +
          Math.floor(Math.random() * possibleField) +
          side;
      } while (this.gameState.occupiedPositions.has(position));
      this.gameState.occupiedPositions.add(position);
      this.gameState.positions.push(new PositionedCharacter(char, position));
    }
  }

  async onCellClick(index) {
    // select active char
    if (!this.selectedChar && this.gameState.occupiedPositions.has(index)) {
      const { lordAi } = this.gameState.positions.find((char) => char.position === index).character;
      if (lordAi) {
        GamePlay.showError('Нельзя выбрать персонаж ИИ');
      }
      if (!lordAi) {
        this.selectChar(index);
      }
    }

    // char active, move!
    if (this.selectedChar && !this.gameState.occupiedPositions.has(index)) {
      if (
        this.checkMoveRange(
          index,
          this.selectedChar.position,
          this.selectedChar.character.moveDistance
        )
      ) {
        this.moveChar(index);
        if (this.gameState.playerMove === false) {
          await this.turnAI();
        }
      }
    }

    // char active, change char or attack
    if (this.selectedChar && this.gameState.occupiedPositions.has(index)) {
      const { lordAi } = this.gameState.positions.find((char) => char.position === index).character; // I assume that AI won't click, so for him will create new func
      if (!lordAi) {
        // select it
        this.selectChar(index);
      }
      if (
        lordAi &&
        this.checkAttackRange(
          index,
          this.selectedChar.position,
          this.selectedChar.character.attackDistance
        )
      ) {
        // attack!
        await this.attackOpponent(index);
        if (this.gameState.playerMove === false) {
          await this.turnAI();
        }
      }
    }
  }

  onCellEnter(index) {
    // ranges concern
    this.selectPointer(index);

    // if there is clear cell, do nthg
    if (!this.gameState.occupiedPositions.has(index)) {
      return;
    }

    // else show tooltip
    const { level, attack, defence, health } = this.gameState.positions.find(
      (char) => char.position === index
    ).character;
    const message = `${String.fromCodePoint(127894) + level} ${String.fromCodePoint(
      9876
    )}${attack} ${String.fromCodePoint(128737)}${defence} ${String.fromCodePoint(10084)}${health}`;
    this.gamePlay.showCellTooltip(message, index);
  }

  onCellLeave(index) {
    try {
      this.gamePlay.hideCellTooltip(index);
      if (this.selectedChar && index !== this.selectedChar.position) {
        this.gamePlay.deselectCell(index);
      }
    } catch (error) {
      // 2 catch error hideCellTooltip shows after levelUp
    }
  }

  selectPointer(index) {
    this.gamePlay.setCursor(cursors.auto);

    if (this.gameState.occupiedPositions.has(index)) {
      if (!this.gameState.positions.find((char) => char.position === index).character.lordAi) {
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }

    if (this.selectedChar && index !== this.selectedChar.position) {
      const { attackDistance, moveDistance } = this.selectedChar.character;
      const charCoord = this.selectedChar.position;

      switch (true) {
        // empty cell inside move range
        case this.checkMoveRange(index, charCoord, moveDistance) &&
          !this.gameState.occupiedPositions.has(index):
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
          break;
        // non-empty in attack range
        case this.checkAttackRange(index, charCoord, attackDistance) &&
          this.gameState.occupiedPositions.has(index): {
          const { lordAi } = this.gameState.positions.find(
            (char) => char.position === index
          ).character;
          if (!lordAi) {
            this.gamePlay.setCursor(cursors.pointer);
          }
          if (lordAi) {
            this.gamePlay.setCursor(cursors.crosshair);
            this.gamePlay.selectCell(index, 'red');
          }
          break;
        }
        // non-empty out attack range
        case this.gameState.occupiedPositions.has(index):
          if (!this.gameState.positions.find((char) => char.position === index).character.lordAi) {
            this.gamePlay.setCursor(cursors.pointer);
          } else {
            this.gamePlay.setCursor(cursors.notallowed);
          }
          break;
        default:
          this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  calculateCoordinates(index) {
    // charCoord 0 - column 1 - row
    const size = this.gamePlay.boardSize;
    for (let i = 0; i < size; i += 1) {
      // check if the index parameter is in the row
      if (index < size * i + size && index >= size * i) {
        // return x, y
        return [index - size * i, i];
      }
    }
    return null;
  }

  calculateIndex(coordinates) {
    const size = this.gamePlay.boardSize;
    return coordinates[1] * size + coordinates[0];
  }

  checkAttackRange(firstIndex, secondIndex, range) {
    const firstCoord = this.calculateCoordinates(firstIndex);
    const secondCoord = this.calculateCoordinates(secondIndex);
    const distanceColumn = Math.abs(firstCoord[0] - secondCoord[0]);
    const distanceRow = Math.abs(firstCoord[1] - secondCoord[1]);
    return range >= distanceRow && range >= distanceColumn;
  }

  checkMoveRange(firstIndex, secondIndex, range) {
    const firstCoord = this.calculateCoordinates(firstIndex);
    const secondCoord = this.calculateCoordinates(secondIndex);
    const distanceColumn = Math.abs(firstCoord[0] - secondCoord[0]);
    const distanceRow = Math.abs(firstCoord[1] - secondCoord[1]);
    return (
      range >= distanceRow &&
      range >= distanceColumn &&
      (distanceRow === distanceColumn || distanceRow === 0 || distanceColumn === 0)
    );
  }

  getDistance(firstIndex, secondIndex) {
    const firstCoord = this.calculateCoordinates(firstIndex);
    const secondCoord = this.calculateCoordinates(secondIndex);
    const distanceColumn = Math.abs(firstCoord[0] - secondCoord[0]);
    const distanceRow = Math.abs(firstCoord[1] - secondCoord[1]);
    return distanceRow + distanceColumn;
  }

  selectChar(index) {
    // unpaint prev cell
    if (this.selectedCell || this.selectedCell === 0) {
      this.gamePlay.deselectCell(this.selectedCell);
    }
    // clear active char
    this.selectedChar = null;
    // paint new cell
    this.gamePlay.selectCell(index);
    // put data into gameState
    this.selectedCell = index;
    this.selectedChar = this.gameState.positions.find((char) => char.position === index);
  }

  moveChar(index) {
    this.gameState.occupiedPositions.delete(this.selectedChar.position);
    this.gamePlay.deselectCell(this.selectedCell);
    this.selectedChar.position = index; // here we auto redraw index in gameState.positions
    this.gameState.occupiedPositions.add(index);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.gameState.playerMove = !this.gameState.playerMove;
  }

  async turnAI() {
    // take random ai char and put him into gameState
    const attackers = this.gameState.positions.filter((item) => item.character.lordAi === true);
    if (attackers.length === 0) {
      return;
    }
    this.selectedChar = attackers[Math.floor(Math.random() * attackers.length)];

    // show him on the board
    this.selectChar(this.selectedChar.position);

    // take his ranges
    const { attackDistance, moveDistance } = this.selectedChar.character;

    // take user chars from the board
    const victims = this.gameState.positions.filter((item) => item.character.lordAi === false);

    // check attack ranges to these chars
    const victim = victims.find((item) =>
      this.checkAttackRange(item.position, this.selectedChar.position, attackDistance)
    );

    if (victim) {
      // if someone is in range, attack him
      await this.attackOpponent(victim.position);
    } else {
      // else move towards nearest
      // find nearest user char
      const nearest = Math.min(
        ...victims.map((item) => this.getDistance(item.position, this.selectedChar.position))
      );
      // get nearest coords
      const nearestCoord = this.calculateCoordinates(
        victims[
          victims
            .map((item) => this.getDistance(item.position, this.selectedChar.position))
            .indexOf(nearest)
        ].position
      );

      // get attacker coords
      const aiCharCoord = this.calculateCoordinates(this.selectedChar.position);

      // get direction and distance
      const diffCoord = [];
      diffCoord[0] = nearestCoord[0] - aiCharCoord[0];
      diffCoord[1] = nearestCoord[1] - aiCharCoord[1];
      if (Math.abs(diffCoord[0]) === Math.abs(diffCoord[1])) {
        // diags
        if (Math.abs(diffCoord[0]) > moveDistance) {
          for (let i = 0; i <= 1; i += 1) {
            aiCharCoord[i] += moveDistance * Math.sign(diffCoord[i]);
          }
        }
        if (Math.abs(diffCoord[0]) <= moveDistance) {
          for (let i = 0; i <= 1; i += 1) {
            aiCharCoord[i] += diffCoord[i] - Math.sign(diffCoord[i]);
          }
        }
      } else if (diffCoord[0] === 0) {
        // verticals
        if (Math.abs(diffCoord[1]) > moveDistance) {
          aiCharCoord[1] += moveDistance * Math.sign(diffCoord[1]);
        }
        if (Math.abs(diffCoord[1]) <= moveDistance) {
          aiCharCoord[1] += diffCoord[1] - Math.sign(diffCoord[1]);
        }
      } else if (diffCoord[1] === 0) {
        // horizontals
        if (Math.abs(diffCoord[0]) > moveDistance) {
          aiCharCoord[0] += moveDistance * Math.sign(diffCoord[0]);
        }
        if (Math.abs(diffCoord[0]) <= moveDistance) {
          aiCharCoord[0] += diffCoord[0] - Math.sign(diffCoord[0]);
        }
      } else if (Math.abs(diffCoord[0]) > Math.abs(diffCoord[1])) {
        // mixed
        for (let i = 0; i <= 1; i += 1) {
          aiCharCoord[i] += Math.abs(diffCoord[1]) * Math.sign(diffCoord[i]);
        }
      } else if (Math.abs(diffCoord[0]) < Math.abs(diffCoord[1])) {
        for (let i = 0; i <= 1; i += 1) {
          aiCharCoord[i] += Math.abs(diffCoord[0]) * Math.sign(diffCoord[i]);
        }
      }

      // if new cell isnt empty, reduce moving (if move really was)
      // get old position
      const aiCharCoordOld = this.calculateCoordinates(this.selectedChar.position);
      while (this.gameState.occupiedPositions.has(this.calculateIndex(aiCharCoord))) {
        for (let i = 0; i <= 1; i += 1) {
          aiCharCoord[i] =
            aiCharCoord[i] === aiCharCoordOld[i]
              ? aiCharCoord[i]
              : aiCharCoord[i] - Math.sign(diffCoord[i]);
        }
        if (aiCharCoord[0] === aiCharCoordOld[0] && aiCharCoord[1] === aiCharCoordOld[1]) break;
        // the smartest way is to pass the turn to the another AI char here, but i'll do it next time
      }
      this.moveChar(this.calculateIndex(aiCharCoord));
    }
    // clear cell selection
    for (let i = 0; i < 64; i += 1) {
      this.gamePlay.deselectCell(i);
    }
    // clear active char
    this.selectedChar = null;
    this.gamePlay.setCursor(cursors.auto);
  }

  async attackOpponent(index) {
    this.removeCellListeners();
    // shoot'em down
    const attacked = this.gameState.positions.find((item) => item.position === index);
    const attackPoints = this.selectedChar.character.attack;
    const defencePoints = attacked.character.defence;
    const damage = Math.round(Math.max(attackPoints - defencePoints, attackPoints * 0.1));
    await this.gamePlay.showDamage(index, damage).then(() => {
      attacked.character.health -= damage;
      this.checkDeathStatus(index);
      this.gamePlay.redrawPositions(this.gameState.positions);
      this.selectPointer(index);
    });
    this.gameState.playerMove = !this.gameState.playerMove;
    if (this.gameState.positions.findIndex((item) => item.character.lordAi === true) === -1) {
      if (this.gameState.level !== 4) {
        this.levelUp();
      } else {
        this.endGame();
      }
    } else if (
      this.gameState.positions.findIndex((item) => item.character.lordAi === false) === -1
    ) {
      GamePlay.showMessage('Вы проиграли!');
      this.newGame();
    } else {
      this.addCellListeners();
    }
  }

  checkDeathStatus(index) {
    const attacked = this.gameState.positions.find((item) => item.position === index);
    if (attacked.character.health <= 0) {
      this.gameState.positions.splice(
        this.gameState.positions.findIndex((item) => item.position === index),
        1
      );
      for (let i = 0; i < 64; i += 1) {
        this.gamePlay.deselectCell(i);
      }
      this.gameState.occupiedPositions.delete(index);
    }
  }

  /**
   * levelUp
   * Повышение показателей атаки/защиты также привязаны к оставшейся жизни по формуле:
   * attackAfter = Math.max(attackBefore, attackBefore * (1.8 - life) / 100),
   * т.е. если у персонажа после окончания раунда жизни осталось 50%,
   * то его показатели улучшаться на 30%.
   * Если же жизни осталось 1%, то показатели никак не увеличатся.
   * !! формула некорректна? переписал формулу похоже на описание
   */
  levelUp() {
    this.gameState.occupiedPositions.clear();
    this.selectedCell = null;
    this.selectedChar = null;
    this.gameState.playerMove = true;

    this.gameState.positions
      .filter((item) => item.character.lordAi === false)
      .filter((item) => item.health > 0);

    this.teamUser.characters.length = 0;
    this.teamAi.characters.length = 0;
    this.gameState.positions.forEach((item) => {
      this.teamUser.characters.push(item.character);
    });

    this.gameState.userStats += this.teamUser.characters.reduce(
      (acc, prev) => acc + prev.health,
      0
    );
    GamePlay.showMessage(
      `Уровень ${this.gameState.level} очищен! Ваш счёт: ${this.gameState.userStats}`
    );

    this.gameState.positions.length = 0;
    this.teamUser.characters.forEach((item) => {
      Object.setPrototypeOf(item, Character.prototype);
      item.levelUp();
    });

    this.gameState.level += 1;
    this.teamsInit(this.gameState.level);

    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.addCellListeners();
  }

  endGame() {
    const alive = this.gameState.positions
      .filter((item) => !item.character.lordAi)
      .filter((item) => item.character.health > 0);
    this.gameState.userStats += alive.reduce((acc, item) => acc + item.character.health, 0);
    for (let i = 0; i < 64; i += 1) {
      this.gamePlay.deselectCell(i);
    }
    this.selectedCell = null;
    this.selectedChar = null;
    this.removeCellListeners();
    this.gamePlay.setCursor(cursors.notallowed);
    GamePlay.showMessage(`Вы победили co cчётом: ${this.gameState.userStats}`);
  }
}
