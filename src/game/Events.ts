import type { GameState, Buff } from "./Player";
import { roll } from "./RNG";
import { recalcEntropyPerSecond } from "./Player";
import { generateRelic } from "./Loot";

export interface GameEvent {
  name: string;
  baseChance: number;
  apply: (state: GameState, now: number) => string;
}

const EVENTS: GameEvent[] = [
  {
    name: "Quantum Surge",
    baseChance: 0.15,
    apply(state: GameState, now: number): string {
      const buff: Buff = {
        name: "Quantum Surge",
        multiplier: 2,
        endsAt: now + 10000,
      };
      state.buffs.push(buff);
      recalcEntropyPerSecond(state);
      return "⚡ Quantum Surge! x2 production for 10s";
    },
  },
  {
    name: "Entropy Leak",
    baseChance: 0.08,
    apply(state: GameState): string {
      const lost = Math.floor(state.entropy * 0.05);
      state.entropy = Math.max(0, state.entropy - lost);
      return `🕳️ Entropy Leak! Lost ${formatNumber(lost)} entropy`;
    },
  },
  {
    name: "Dimensional Tear",
    baseChance: 0.03,
    apply(state: GameState): string {
      const relic = generateRelic();
      state.relics.push(relic);
      recalcEntropyPerSecond(state);
      return `🌀 Dimensional Tear! Found relic: ${relic.name} [${relic.rarity}]`;
    },
  },
  {
    name: "Ancient Entity",
    baseChance: 0.005,
    apply(state: GameState): string {
      state.permanentMultiplier += 0.01;
      recalcEntropyPerSecond(state);
      return "👁️ Ancient Entity appeared! +1% permanent multiplier";
    },
  },
  {
    name: "Big Glitch",
    baseChance: 0.0001,
    apply(state: GameState, now: number): string {
      const buff: Buff = {
        name: "Big Glitch",
        multiplier: 50,
        endsAt: now + 5000,
      };
      state.buffs.push(buff);
      recalcEntropyPerSecond(state);
      return "🔥 BIG GLITCH! x50 production for 5s!!!";
    },
  },
];

const BASE_EVENT_CHANCE = 0.05;

export function checkEvents(state: GameState, now: number): string[] {
  const messages: string[] = [];
  const realChance = BASE_EVENT_CHANCE * state.instability;

  if (!roll(realChance)) {
    return messages;
  }

  for (const event of EVENTS) {
    if (roll(event.baseChance)) {
      const msg = event.apply(state, now);
      messages.push(msg);
      break;
    }
  }

  return messages;
}

export function updateBuffs(state: GameState, now: number): void {
  const before = state.buffs.length;
  state.buffs = state.buffs.filter((b) => b.endsAt > now);
  if (state.buffs.length !== before) {
    recalcEntropyPerSecond(state);
  }
}

function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(0);
}
