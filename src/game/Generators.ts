import type { GameState } from "./Player";
import { getGeneratorCost, recalcEntropyPerSecond } from "./Player";

export function buyGenerator(state: GameState, index: number): boolean {
  const gen = state.generators[index];
  if (!gen) return false;

  const cost = getGeneratorCost(gen);
  if (state.entropy < cost) return false;

  state.entropy -= cost;
  gen.owned += 1;

  state.instability = 1 + state.generators.reduce((a, g) => a + g.owned, 0) * 0.01;

  recalcEntropyPerSecond(state);
  return true;
}
