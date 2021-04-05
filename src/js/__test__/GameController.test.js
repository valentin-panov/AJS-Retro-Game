/* eslint-disable no-undef */
import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';

let gamePlay;
let stateService;
let gameController;

beforeEach(() => {
  const container = document.createElement('div');
  container.setAttribute('id', 'game-container');
  gamePlay = new GamePlay();
  gamePlay.bindToDOM(container);
  stateService = new GameStateService(localStorage); // ! localStorage?
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

test('gameplay.showCellTooltip should trigger on mouse over occupied cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();
  gameController.onCellEnter(0);
  expect(gameController.gamePlay.showCellTooltip).toBeCalled();
});

test('gameplay.showCellTooltip shouldnt trigger on mouse over unoccupied cell', () => {
  gameController.gamePlay.showCellTooltip = jest.fn();
  gameController.onCellEnter(2);
  expect(gameController.gamePlay.showCellTooltip).toBeCalledTimes(0);
});
