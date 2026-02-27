import type { GameState } from "./Player";

const SAVE_KEY = "entropySave";

export function save(state: GameState): void {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, json);
  } catch {
    console.warn("Failed to save game state");
  }
}

export function load(): GameState | null {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    return JSON.parse(json) as GameState;
  } catch {
    console.warn("Failed to load game state");
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
