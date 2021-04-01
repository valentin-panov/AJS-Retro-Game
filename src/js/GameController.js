import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './themes';
import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay || new GamePlay();
    this.stateService = stateService;
    this.gameState = new GameState();
  }

  init() {
    const level = 1;
    this.teamsInit(level);
    this.gamePlay.drawUi(themes[level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  teamsInit(level) {
    // создаём начальные команды игрока и компьютера
    if (level === 1) {
      this.gameState.teamUser = new Team('User', level, 2);
    } else {
      this.gameState.teamUser.addChar(level);
    }
    this.gameState.teamAi = new Team('ai', level, this.gameState.teamUser.characters.length);

    let position = null;
    // разбрасываем команду игрока
    for (const char of this.gameState.teamUser.characters) {
      do {
        position = Math.floor(0 + Math.random() * 7) * 8 + Math.floor(0 + Math.random() * 2);
      } while (this.gameState.occupiedPositions.has(position));
      this.gameState.occupiedPositions.add(position);
      this.gameState.positions.push(new PositionedCharacter(char, position));
    }
    // разбрасываем команду ИИ
    for (const char of this.gameState.teamAi.characters) {
      do {
        position = Math.floor(0 + Math.random() * 7) * 8 + Math.floor(0 + Math.random() * 2) + 6;
      } while (this.gameState.occupiedPositions.has(position));
      this.gameState.occupiedPositions.add(position);
      this.gameState.positions.push(new PositionedCharacter(char, position));
    }
  }

  async moveAI() {
    // ! take random ai char and put him into gameState
    const attackers = this.gameState.positions.filter((char) => char.character.lordAi === true);
    if (attackers.length === 0) {
      return;
    }
    this.gameState.selectedChar = attackers[Math.floor(Math.random() * attackers.length)];

    // ! show him on the board
    this.selectChar(this.gameState.selectedChar.position);

    // ! take his ranges
    const { attackDistance, moveDistance } = this.gameState.selectedChar.character;

    // ! take user chars from the board
    const victims = this.gameState.positions.filter((char) => char.character.lordAi === false);

    // ! check attack ranges to these chars
    const victim = victims.find((item) =>
      this.checkRange(item.position, this.gameState.selectedChar.position, attackDistance)
    );

    if (victim) {
      // ! if someone is in range, attack him
      await this.attackOpponent(victim.position);
    } else {
      // ! else move towards nearest
      const nearest = Math.min(
        ...victims.map((item) =>
          this.getDistance(item.position, this.gameState.selectedChar.position)
        )
      );

      const nearestCoord = this.calculateCoordinates(
        victims[
          victims
            .map((item) => this.getDistance(item.position, this.gameState.selectedChar.position))
            .indexOf(nearest)
        ].position
      );

      const aiCharCoord = this.calculateCoordinates(this.gameState.selectedChar.position);
      for (let i = 0; i <= 1; i += 1) {
        switch (true) {
          case aiCharCoord[i] > nearestCoord[i] && aiCharCoord[i] - nearestCoord[i] > moveDistance:
            aiCharCoord[i] -= moveDistance;
            break;
          case aiCharCoord[i] > nearestCoord[i] &&
            aiCharCoord[i] - nearestCoord[i] === moveDistance:
            aiCharCoord[i] -= moveDistance - 1;
            break;
          case aiCharCoord[i] > nearestCoord[i] && aiCharCoord[i] - nearestCoord[i] < moveDistance:
            aiCharCoord[i] -= aiCharCoord[i] - nearestCoord[i] - 1;
            break;
          case aiCharCoord[i] < nearestCoord[i] && nearestCoord[i] - aiCharCoord[i] > moveDistance:
            aiCharCoord[i] += moveDistance;
            break;
          case aiCharCoord[i] < nearestCoord[i] &&
            nearestCoord[i] - aiCharCoord[i] === moveDistance:
            aiCharCoord[i] += moveDistance - 1;
            break;
          case aiCharCoord[i] < nearestCoord[i] && nearestCoord[i] - aiCharCoord[i] < moveDistance:
            aiCharCoord[i] += nearestCoord[i] - aiCharCoord[i] - 1;
            break;
          default:
            break;
        }
      }
      // ! if that cell isnt empty, reduce moving
      while (this.gameState.occupiedPositions.has(this.calculateIndex(aiCharCoord))) {
        for (let i = 0; i <= 1; i += 1) {
          switch (true) {
            case aiCharCoord[i] > nearestCoord[i]:
              aiCharCoord[i] += 1;
              break;
            case aiCharCoord[i] < nearestCoord[i]:
              aiCharCoord[i] -= 1;
              break;
            default:
              break;
          }
        }
      }
      this.moveChar(this.calculateIndex(aiCharCoord));
    }
    // ! clear cell selection
    for (let i = 0; i < 64; i += 1) {
      this.gamePlay.deselectCell(i);
    }
    // ! clear active char
    this.gameState.selectedChar = null;
    this.gamePlay.setCursor(cursors.auto);
  }

  async onCellClick(index) {
    // select active char
    if (!this.gameState.selectedChar && this.gameState.occupiedPositions.has(index)) {
      const { lordAi } = this.gameState.positions.find((char) => char.position === index).character;
      if (lordAi) {
        GamePlay.showError('Нельзя выбрать персонаж ИИ');
      }
      if (!lordAi) {
        this.selectChar(index);
      }
    }

    // char active, move!
    if (this.gameState.selectedChar && !this.gameState.occupiedPositions.has(index)) {
      if (
        this.checkRange(
          index,
          this.gameState.selectedChar.position,
          this.gameState.selectedChar.character.moveDistance
        )
      ) {
        this.moveChar(index);
        if (this.gameState.playerMove === false) {
          await this.moveAI();
        }
      }
    }

    // char active, change char or attack
    if (this.gameState.selectedChar && this.gameState.occupiedPositions.has(index)) {
      const { lordAi } = this.gameState.positions.find((char) => char.position === index).character; // I assume that AI won't click, so for him will create new func
      if (!lordAi) {
        // select it
        this.selectChar(index);
      }
      if (
        lordAi &&
        this.checkRange(
          index,
          this.gameState.selectedChar.position,
          this.gameState.selectedChar.character.attackDistance
        )
      ) {
        // attack!
        await this.attackOpponent(index);
        if (this.gameState.playerMove === false) {
          await this.moveAI();
        }
      }
    }
    // TODO: react to click
  }

  onCellEnter(index) {
    // show tooltip
    if (this.gameState.occupiedPositions.has(index)) {
      const { level, attack, defence, health } = this.gameState.positions.find(
        (char) => char.position === index
      ).character;
      const message = `${String.fromCodePoint(127894) + level} ${String.fromCodePoint(
        9876
      )}${attack} ${String.fromCodePoint(128737)}${defence} ${String.fromCodePoint(
        10084
      )}${health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    // ranges concern
    this.selectPointer(index);
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (this.gameState.selectedChar && index !== this.gameState.selectedChar.position) {
      this.gamePlay.deselectCell(index);
    }
    // TODO: react to mouse leave
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

    if (this.gameState.selectedChar && index !== this.gameState.selectedChar.position) {
      const { attackDistance, moveDistance } = this.gameState.selectedChar.character;
      const charCoord = this.gameState.selectedChar.position;

      switch (true) {
        // empty cell inside move range
        case this.checkRange(index, charCoord, moveDistance) &&
          !this.gameState.occupiedPositions.has(index):
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
          break;
        // non-empty in attack range
        case this.checkRange(index, charCoord, attackDistance) &&
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

  checkRange(firstIndex, secondIndex, range) {
    const firstCoord = this.calculateCoordinates(firstIndex);
    const secondCoord = this.calculateCoordinates(secondIndex);
    const distanceColumn = Math.abs(firstCoord[0] - secondCoord[0]);
    const distanceRow = Math.abs(firstCoord[1] - secondCoord[1]);
    return range >= distanceRow && range >= distanceColumn;
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
    if (this.gameState.selectedCell || this.gameState.selectedCell === 0) {
      this.gamePlay.deselectCell(this.gameState.selectedCell);
    }
    // clear active char
    this.gameState.selectedChar = null;
    // paint new cell
    this.gamePlay.selectCell(index);
    // put data into gameState
    this.gameState.selectedCell = index;
    this.gameState.selectedChar = this.gameState.positions.find((char) => char.position === index);
  }

  moveChar(index) {
    this.gameState.occupiedPositions.delete(this.gameState.selectedChar.position);
    this.gamePlay.deselectCell(this.gameState.selectedCell);
    this.gamePlay.selectCell(index);
    this.gameState.selectedCell = index;
    this.gameState.selectedChar.position = index;
    this.gameState.occupiedPositions.add(index);
    this.gamePlay.redrawPositions(this.gameState.positions);
    this.gameState.playerMove = !this.gameState.playerMove;
  }

  checkDeathStatus(index) {
    const attacked = this.gameState.positions.find((char) => char.position === index);
    if (attacked.character.health <= 0) {
      this.gameState.positions.splice(
        this.gameState.positions.findIndex((char) => char.position === index),
        1
      );
      for (let i = 0; i < 64; i += 1) {
        this.gamePlay.deselectCell(i);
      }
      this.gameState.occupiedPositions.delete(index);
    }
  }

  async attackOpponent(index) {
    // shoot'em down
    const attacked = this.gameState.positions.find((char) => char.position === index);
    const attackPoints = this.gameState.selectedChar.character.attack;
    const defencePoints = attacked.character.defence;
    const damage = Math.max(attackPoints - defencePoints, attackPoints * 0.1);
    await this.gamePlay.showDamage(index, damage).then(() => {
      attacked.character.health -= damage;
      this.checkDeathStatus(index);
      this.gamePlay.redrawPositions(this.gameState.positions);
      this.selectPointer(index);
    });
    this.gameState.playerMove = !this.gameState.playerMove;
    if (this.gameState.positions.findIndex((char) => char.character.lordAi === true) === -1) {
      alert('win');
      await this.levelUp();
    }
    if (this.gameState.positions.findIndex((char) => char.character.lordAi === false) === -1) {
      alert('You loose the match');
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

  async levelUp() {
    this.gameState.teamAi.length = 0;
    this.gameState.positions.length = 0;
    this.gameState.occupiedPositions.clear();
    this.gameState.playerMove = true;
    this.gameState.teamUser.characters = this.gameState.teamUser.characters.filter(
      (char) => char.health > 0
    );
    this.gameState.teamUser.characters.forEach((item) => {
      const { health, attack, defence } = item;
      item.attack = Math.max(attack, Math.round(attack * (0.8 + health / 100)));
      item.defence = Math.max(defence, Math.round(defence * (0.8 + health / 100)));
      item.level += 1;
      item.health += 80;
      item.health = item.health < 100 ? item.health : 100;
    });
    this.gameState.teamUser.level += 1;
    this.teamsInit(this.gameState.teamUser.level);
    this.gamePlay.drawUi(themes[this.gameState.teamUser.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
  }
}
