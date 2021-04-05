import { calcTileType, calcHealthLevel } from '../utils';

test.each([
  [0, 'top-left'],
  [1, 'top'],
  [2, 'top-right'],
  [3, 'left'],
  [4, 'center'],
  [5, 'right'],
  [6, 'bottom-left'],
  [7, 'bottom'],
  [8, 'bottom-right'],
])('func calcTileType should return correct values', (index, expected) => {
  expect(calcTileType(index, 3)).toBe(expected);
});

test.each([
  [14, 'critical'],
  [49, 'normal'],
  [50, 'high'],
])('func calcHealthLevel should return correct health value', (health, expected) => {
  expect(calcHealthLevel(health)).toBe(expected);
});
