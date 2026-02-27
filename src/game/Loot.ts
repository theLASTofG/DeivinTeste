import type { Relic } from "./Player";
import { weighted } from "./RNG";

interface RarityDef {
  name: string;
  chance: number;
  multiplierRange: [number, number];
  instabilityRange: [number, number];
}

const RARITIES: RarityDef[] = [
  { name: "Common", chance: 60, multiplierRange: [0.01, 0.05], instabilityRange: [0, 0.01] },
  { name: "Uncommon", chance: 25, multiplierRange: [0.05, 0.15], instabilityRange: [0.01, 0.03] },
  { name: "Rare", chance: 10, multiplierRange: [0.15, 0.35], instabilityRange: [0.02, 0.05] },
  { name: "Epic", chance: 4, multiplierRange: [0.35, 0.75], instabilityRange: [0.03, 0.08] },
  { name: "Mythic", chance: 0.9, multiplierRange: [0.75, 1.5], instabilityRange: [0.05, 0.15] },
  { name: "Glitched", chance: 0.1, multiplierRange: [1.5, 5.0], instabilityRange: [0.1, 0.3] },
];

const RELIC_NAMES: Record<string, string[]> = {
  Common: ["Entropy Shard", "Fading Crystal", "Dust Mote"],
  Uncommon: ["Void Fragment", "Pulsing Gem", "Phase Stone"],
  Rare: ["Reality Splinter", "Chrono Core", "Rift Pearl"],
  Epic: ["Dimensional Heart", "Singularity Orb", "Aether Prism"],
  Mythic: ["Cosmic Keystone", "Primordial Flame", "Infinity Loop"],
  Glitched: ["#ERR_RELIC", "N̷U̷L̷L̷", "∞ Fragment"],
};

const EFFECTS: Record<string, string[]> = {
  Common: ["Slightly boosts production", "Minor entropy gain"],
  Uncommon: ["Boosts production", "Increases instability slightly"],
  Rare: ["Significantly boosts production", "Alters probability fields"],
  Epic: ["Greatly boosts production", "Warps local reality"],
  Mythic: ["Massively boosts production", "Bends spacetime"],
  Glitched: ["R̸E̸A̸L̸I̸T̸Y̸ ̸E̸R̸R̸O̸R̸", "Breaks the simulation"],
};

let relicCounter = 0;

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRelic(): Relic {
  const rarityDef = weighted(
    RARITIES.map((r) => ({ item: r, weight: r.chance }))
  );

  relicCounter++;
  const names = RELIC_NAMES[rarityDef.name] ?? ["Unknown Relic"];
  const effects = EFFECTS[rarityDef.name] ?? ["Unknown effect"];

  return {
    id: `relic_${relicCounter}_${Date.now()}`,
    name: pickRandom(names),
    rarity: rarityDef.name,
    effect: pickRandom(effects),
    multiplier: parseFloat(
      randomInRange(rarityDef.multiplierRange[0], rarityDef.multiplierRange[1]).toFixed(3)
    ),
    instabilityMod: parseFloat(
      randomInRange(rarityDef.instabilityRange[0], rarityDef.instabilityRange[1]).toFixed(3)
    ),
  };
}
