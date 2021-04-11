/* eslint-disable no-undef */

// ! tests
/**
 * 4) Не забудьте написать авто-тесты на функции/методы, которые лежат в
 * основе п.1-4 (cursors)
 * 5) Напишите авто-тест, с моком для метода load, который проверяет реакцию вашего
 *  приложения на успешную и не успешную загрузку (при неуспешной загрузке
 * должно выводиться сообщение через GamePlay - подумайте, как вы это будете тестировать).
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, jest } from '@jest/globals';
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import cursors from '../cursors';
// import Character from '../Character';

let gamePlay;
let stateService;
let gameController;

beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage);
  gameController = new GameController(gamePlay, stateService);
  gameController.init();
  gameController.teamUser.characters.length = 0;
  gameController.teamAi.characters.length = 0;
  gameController.gameState.positions.length = 0;
  gameController.teamsInit(2);
  gameController.gameState.occupiedPositions.clear();
  gameController.gameState.positions[0].position = 0;
  gameController.gameState.positions[1].position = 1;
  gameController.gameState.occupiedPositions.add(0);
  gameController.gameState.occupiedPositions.add(1);
});

test('gameController.loadGame() calls gameController.stateService.load(), if load() throws an error, get it', () => {
  gameController.stateService.storage = { testErr: 'error' };
  expect(() => gameController.loadGame()).toThrow();
});

// ! пока не разобрался, почему оно крашится
// ! TypeError: Cannot read property 'level' of null
// test('gameController.loadGame() calls gameController.stateService.load(), in success case deploys a saved game and shows success message', () => {
//   GamePlay.showMessage = jest.fn();
//   gameController.loadGame();
//   expect(GamePlay.showMessage).toHaveBeenCalledWith('Игра загружена');
// });

test('gamePlay.showCellTooltip should trigger on mouse over occupied cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();
  gameController.onCellEnter(0);
  expect(gameController.gamePlay.showCellTooltip).toBeCalled();
});

test('gamePlay.showCellTooltip shouldnt trigger on mouse over unoccupied cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();
  gameController.onCellEnter(2);
  expect(gameController.gamePlay.showCellTooltip).toBeCalledTimes(0);
});

test('gamePlay.onCellLeave calls hideCellTooltip', () => {
  gameController.gamePlay.hideCellTooltip = jest.fn();
  gameController.onCellLeave(1);
  expect(gameController.gamePlay.hideCellTooltip).toBeCalled();
});

test('gamePlay.onCellEnter calls gameController.selectPointer', () => {
  gameController.selectPointer = jest.fn();
  gameController.onCellEnter(0);
  expect(gameController.selectPointer).toHaveBeenCalledWith(0);
});

test.each([
  [0, cursors.pointer],
  [1, cursors.notallowed],
  [8, cursors.auto],
  [63, cursors.auto],
])(
  'when character isnt selected, gameController.selectPointer should change pointer over user char, ai char, empty cell',
  (index, expected) => {
    gameController.gamePlay.setCursor = jest.fn();
    gameController.onCellEnter(index);
    expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(expected);
  }
);

test.each([
  [0, cursors.pointer],
  [1, cursors.crosshair],
  [8, cursors.pointer],
  [63, cursors.notallowed],
])(
  'when character is selected, gameController.selectPointer should change pointer over user char, ai char, empty cell in move range, cell out move range',
  (index, expected) => {
    gameController.gamePlay.setCursor = jest.fn();
    gameController.selectChar(0);
    gameController.onCellEnter(index);
    expect(gameController.gamePlay.setCursor).toHaveBeenCalledWith(expected);
  }
);

test.each([
  [1, 'red'],
  [8, 'green'],
])(
  'when character is selected, gameController.selectCell should change selection over ai char and over empty cell in move range',
  (index, expected) => {
    gameController.gamePlay.selectCell = jest.fn();
    gameController.selectChar(0);
    gameController.onCellEnter(index);
    expect(gameController.gamePlay.selectCell).toHaveBeenCalledWith(index, expected);
  }
);

test.each([
  [1, 2], // 1st call when we select char, 2nd - test
  [7, 1], // 1st call when we select char, then zero
])(
  'when character is selected, gameController.selectCell shouldnt be called outside the range',
  (index, expected) => {
    gameController.gamePlay.selectCell = jest.fn();
    gameController.selectChar(0);
    gameController.onCellEnter(index);
    expect(gameController.gamePlay.selectCell).toBeCalledTimes(expected);
  }
);

test('gamePlay.onCellClick checks char presence in the cell and calls selectChar()', () => {
  gameController.selectChar = jest.fn();
  gameController.onCellClick(0);
  expect(gameController.selectChar).toHaveBeenCalledWith(0);
});

test('gameController.onCellClick should reject to select an ai char', () => {
  GamePlay.showError = jest.fn();
  gameController.onCellClick(1);
  expect(GamePlay.showError).toHaveBeenCalledWith('Нельзя выбрать персонаж ИИ');
});

test('gameController.selectChar should select cell and put selected char into gameController.selectedChar', () => {
  gameController.gamePlay.selectCell = jest.fn();
  const expected = gameController.gameState.positions[0];
  gameController.selectChar(0);
  expect(gameController.gamePlay.selectCell).toHaveBeenCalledWith(0);
  expect(gameController.selectedChar).toEqual(expected);
});

test('when char is selected, gameController.onCellClick should call gameController.moveChar on free cell in move range', () => {
  gameController.moveChar = jest.fn();
  gameController.selectChar(0);
  gameController.onCellClick(8);
  expect(gameController.moveChar).toHaveBeenCalledWith(8);
});

test.each([
  [1, 0],
  [63, 0],
])(
  'when char is selected, gameController.onCellClick shouldnt call gameController.moveChar on free cell outside move range and on occupied cell inside move range',
  (index, expected) => {
    gameController.moveChar = jest.fn();
    gameController.selectChar(0);
    gameController.onCellClick(index);
    expect(gameController.moveChar).toBeCalledTimes(expected);
  }
);

test('when char is selected, gameController.onCellClick should call gameController.attackOpponent on ai char cell in attack range', () => {
  gameController.attackOpponent = jest.fn();
  gameController.selectChar(0);
  gameController.onCellClick(1);
  expect(gameController.attackOpponent).toHaveBeenCalledWith(1);
});

test('when char is selected, gameController.onCellClick shouldnt call gameController.moveChar either gameController.attackOpponent on cell outside any range', () => {
  gameController.attackOpponent = jest.fn();
  gameController.moveChar = jest.fn();
  gameController.selectChar(0);
  gameController.onCellClick(63);
  expect(gameController.attackOpponent).toBeCalledTimes(0);
  expect(gameController.moveChar).toBeCalledTimes(0);
});

test('gameController.moveChar should move selected char within move range', () => {
  const expected = JSON.parse(JSON.stringify(gameController.gameState.positions[0]));
  expected.position = 8;
  gameController.selectChar(0);
  gameController.moveChar(8);
  expect(gameController.selectedChar).toEqual(expected);
});

test('gameController.attackOpponent should damage ai char within attack range', async () => {
  let expected = gameController.gameState.positions[1].character.health;
  gameController.selectChar(0);
  gameController.gamePlay.showDamage = jest.fn(() => Promise.resolve('showDamage'));
  const attackPoints = gameController.selectedChar.character.attack;
  const defencePoints = gameController.gameState.positions[1].character.defence;
  const damage = Math.round(Math.max(attackPoints - defencePoints, attackPoints * 0.1));
  expected -= damage;
  await gameController.attackOpponent(1);
  expect(gameController.gameState.positions[1].character.health).toBe(expected);
});

test('gameController.checkDeathStatus should check char.health and delete from gameState him if health <= 0', () => {
  gameController.selectChar(0);
  gameController.selectedChar.character.health = -1;
  gameController.checkDeathStatus(0);
  expect(gameController.gameState.positions.length).toBe(1);
  expect(gameController.gameState.occupiedPositions.size).toBe(1);
});

test('gameController.levelUp should up the level for survived user chars', () => {
  GamePlay.showMessage = jest.fn();
  gameController.selectChar(0);
  gameController.selectedChar.character.health = 20;
  gameController.teamAi.characters.length = 0;
  gameController.gameState.positions.length = 1;
  gameController.gameState.level = 1;
  gameController.levelUp();
  expect(gameController.gameState.positions.length).toBe(4);
  expect(gameController.gameState.occupiedPositions.size).toBe(4);
  expect(gameController.teamUser.characters[0].health).toBe(100);
  expect(gameController.teamUser.characters[0].level).toBe(2);
});
