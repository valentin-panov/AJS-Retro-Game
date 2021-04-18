/**
 * Calculates tile type based on index
 *
 * @param {number} index
 * @param {number} boardSize
 * @returns {string} tileType
 */
export function calcTileType(index, boardSize) {
  const fullBoard = boardSize ** 2;
  const recalcIndex = index + 1;
  switch (true) {
    case recalcIndex === 1:
      return 'top-left';
    case recalcIndex > 1 && recalcIndex < boardSize:
      return 'top';
    case recalcIndex === boardSize:
      return 'top-right';
    case recalcIndex === fullBoard - boardSize + 1:
      return 'bottom-left';
    case recalcIndex > fullBoard - boardSize && recalcIndex < fullBoard:
      return 'bottom';
    case recalcIndex === fullBoard:
      return 'bottom-right';
    // отсекли явные случаи, например (index > boardSize), дальше не будем включать их в условия
    case Number.isInteger((recalcIndex - 1) / boardSize):
      return 'left';
    case Number.isInteger(recalcIndex / boardSize):
      return 'right';
    default:
      return 'center';
  }
}

/**
 * Graduate health state according health points
 *
 * @param {number} health - health points
 * @returns {string} health state
 */
export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
