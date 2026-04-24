import { getPlacedOrderByHeight } from './legacyStackBridge.js';

export function isPlacementOrderValid(placedLayers, currentOrder) {
  const placedOrder = getPlacedOrderByHeight(placedLayers);
  return placedOrder.every((ingredient, index) => ingredient === currentOrder[index]);
}
