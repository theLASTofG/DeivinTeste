import type { GameState } from "./Player";
import { getGeneratorCost, recalcEntropyPerSecond, recalcInstability } from "./Player";

export function buyGenerator(state: GameState, index: number): boolean {
  const gen = state.generators[index];
  if (!gen) return false;

  const cost = getGeneratorCost(gen);
  if (state.entropy < cost) return false;

  state.entropy -= cost;
  gen.owned += 1;

  recalcInstability(state);
  recalcEntropyPerSecond(state);
  return true;
}
