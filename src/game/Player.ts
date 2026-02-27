export interface GeneratorState {
  name: string;
  baseCost: number;
  production: number;
  owned: number;
}

export interface Relic {
  id: string;
  name: string;
  rarity: string;
  effect: string;
  multiplier: number;
  instabilityMod: number;
}

export interface Buff {
  name: string;
  multiplier: number;
  endsAt: number;
}

export interface GameState {
  entropy: number;
  entropyPerClick: number;
  entropyPerSecond: number;
  instability: number;
  fragments: number;
  totalClicks: number;
  totalEntropy: number;
  generators: GeneratorState[];
  relics: Relic[];
  buffs: Buff[];
  permanentMultiplier: number;
}

export function createInitialState(): GameState {
  return {
    entropy: 0,
    entropyPerClick: 1,
    entropyPerSecond: 0,
    instability: 1,
    fragments: 0,
    totalClicks: 0,
    totalEntropy: 0,
    generators: [
      { name: "Particle Condenser", baseCost: 10, production: 0.1, owned: 0 },
      { name: "Quantum Reactor", baseCost: 100, production: 1, owned: 0 },
      { name: "Reality Compressor", baseCost: 1100, production: 8, owned: 0 },
      { name: "Singularity Engine", baseCost: 12000, production: 47, owned: 0 },
    ],
    relics: [],
    buffs: [],
    permanentMultiplier: 1,
  };
}

export function getGeneratorCost(gen: GeneratorState): number {
  return Math.floor(gen.baseCost * Math.pow(1.15, gen.owned));
}

export function getGlobalMultiplier(state: GameState): number {
  const fragmentBonus = 1 + state.fragments * 0.05;
  const relicBonus = state.relics.reduce((acc, r) => acc + r.multiplier, 0);
  const buffMultiplier = state.buffs.reduce((acc, b) => acc * b.multiplier, 1);
  return fragmentBonus * state.permanentMultiplier * (1 + relicBonus) * buffMultiplier;
}

export function recalcEntropyPerSecond(state: GameState): void {
  const baseEps = state.generators.reduce(
    (acc, g) => acc + g.production * g.owned,
    0
  );
  state.entropyPerSecond = baseEps * getGlobalMultiplier(state);
}
