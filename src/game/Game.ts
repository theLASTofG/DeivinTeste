import type { GameState } from "./Player";
import {
  createInitialState,
  getGlobalMultiplier,
  recalcEntropyPerSecond,
} from "./Player";
import { buyGenerator } from "./Generators";
import { checkEvents, updateBuffs } from "./Events";
import { save, load } from "./SaveSystem";

export type EventLogger = (msg: string) => void;

export class Game {
  state: GameState;
  private lastTick: number;
  private lastSave: number;
  private lastEventCheck: number;
  private onEvent: EventLogger;
  private tickInterval: number | null = null;

  constructor(onEvent: EventLogger) {
    this.onEvent = onEvent;
    const saved = load();
    if (saved) {
      this.state = saved;
      // Ensure buffs array exists for old saves
      if (!this.state.buffs) this.state.buffs = [];
      if (!this.state.permanentMultiplier) this.state.permanentMultiplier = 1;
      if (!this.state.totalEntropy) this.state.totalEntropy = 0;
      recalcEntropyPerSecond(this.state);
      this.onEvent("💾 Game loaded from save");
    } else {
      this.state = createInitialState();
      this.onEvent("🌌 Welcome to Entropy Clicker! Click STABILIZE to begin.");
    }
    const now = Date.now();
    this.lastTick = now;
    this.lastSave = now;
    this.lastEventCheck = now;
  }

  start(): void {
    this.tickInterval = window.setInterval(() => this.tick(), 100);

    window.addEventListener("beforeunload", () => {
      save(this.state);
    });
  }

  stop(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  click(): void {
    const multiplier = getGlobalMultiplier(this.state);
    const gained = this.state.entropyPerClick * multiplier;
    this.state.entropy += gained;
    this.state.totalEntropy += gained;
    this.state.totalClicks += 1;
  }

  buyGen(index: number): boolean {
    return buyGenerator(this.state, index);
  }

  canPrestige(): boolean {
    return this.state.entropy >= 1_000_000;
  }

  getPrestigeFragments(): number {
    return Math.floor(Math.sqrt(this.state.entropy / 100000));
  }

  prestige(): void {
    if (!this.canPrestige()) return;

    const fragmentsGained = this.getPrestigeFragments();
    this.state.fragments += fragmentsGained;

    // Keep fragments, permanentMultiplier
    const fragments = this.state.fragments;
    const permanentMultiplier = this.state.permanentMultiplier;

    // Reset state
    const fresh = createInitialState();
    fresh.fragments = fragments;
    fresh.permanentMultiplier = permanentMultiplier;

    this.state = fresh;
    recalcEntropyPerSecond(this.state);
    save(this.state);

    this.onEvent(
      `🔄 Prestige! Gained ${fragmentsGained} Reality Fragments. Total: ${fragments}`
    );
  }

  private tick(): void {
    const now = Date.now();
    const deltaMs = now - this.lastTick;
    const deltaSec = deltaMs / 1000;
    this.lastTick = now;

    // Passive production
    const produced = this.state.entropyPerSecond * deltaSec;
    this.state.entropy += produced;
    this.state.totalEntropy += produced;

    // Update buffs
    updateBuffs(this.state, now);

    // Event check every ~1 second
    if (now - this.lastEventCheck >= 1000) {
      this.lastEventCheck = now;
      const msgs = checkEvents(this.state, now);
      for (const msg of msgs) {
        this.onEvent(msg);
      }
    }

    // Auto-save every 10 seconds
    if (now - this.lastSave >= 10000) {
      this.lastSave = now;
      save(this.state);
    }
  }
}
