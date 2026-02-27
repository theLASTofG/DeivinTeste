import type { Game } from "../game/Game";
import { getGeneratorCost, getGlobalMultiplier } from "../game/Player";

const MAX_LOG_ENTRIES = 10;

export class UI {
  private game: Game;
  private eventLog: string[] = [];

  // Elements
  private entropyDisplay!: HTMLElement;
  private epsDisplay!: HTMLElement;
  private instabilityDisplay!: HTMLElement;
  private fragmentsDisplay!: HTMLElement;
  private multiplierDisplay!: HTMLElement;
  private clicksDisplay!: HTMLElement;
  private stabilizeBtn!: HTMLButtonElement;
  private generatorsContainer!: HTMLElement;
  private eventLogContainer!: HTMLElement;
  private prestigeBtn!: HTMLButtonElement;
  private prestigeInfo!: HTMLElement;
  private relicsContainer!: HTMLElement;
  private buffsContainer!: HTMLElement;

  constructor(game: Game) {
    this.game = game;
  }

  init(): void {
    this.entropyDisplay = this.getEl("entropy-value");
    this.epsDisplay = this.getEl("eps-value");
    this.instabilityDisplay = this.getEl("instability-value");
    this.fragmentsDisplay = this.getEl("fragments-value");
    this.multiplierDisplay = this.getEl("multiplier-value");
    this.clicksDisplay = this.getEl("clicks-value");
    this.stabilizeBtn = this.getEl("stabilize-btn") as HTMLButtonElement;
    this.generatorsContainer = this.getEl("generators-list");
    this.eventLogContainer = this.getEl("event-log");
    this.prestigeBtn = this.getEl("prestige-btn") as HTMLButtonElement;
    this.prestigeInfo = this.getEl("prestige-info");
    this.relicsContainer = this.getEl("relics-list");
    this.buffsContainer = this.getEl("buffs-list");

    this.stabilizeBtn.addEventListener("click", () => {
      this.game.click();
      this.stabilizeBtn.classList.add("clicked");
      setTimeout(() => this.stabilizeBtn.classList.remove("clicked"), 100);
      this.render();
    });

    this.prestigeBtn.addEventListener("click", () => {
      if (this.game.canPrestige()) {
        this.game.prestige();
        this.renderGenerators();
        this.render();
      }
    });

    this.renderGenerators();
    this.render();

    setInterval(() => this.render(), 100);
  }

  addLogEntry(msg: string): void {
    this.eventLog.unshift(msg);
    if (this.eventLog.length > MAX_LOG_ENTRIES) {
      this.eventLog.pop();
    }
    this.renderLog();
  }

  private render(): void {
    const s = this.game.state;
    this.entropyDisplay.textContent = formatNumber(s.entropy);
    this.epsDisplay.textContent = formatNumber(s.entropyPerSecond) + "/s";
    this.instabilityDisplay.textContent = s.instability.toFixed(2) + "x";
    this.fragmentsDisplay.textContent = s.fragments.toString();
    this.multiplierDisplay.textContent =
      getGlobalMultiplier(s).toFixed(2) + "x";
    this.clicksDisplay.textContent = s.totalClicks.toString();

    // Update generator buy buttons
    const buttons = this.generatorsContainer.querySelectorAll<HTMLButtonElement>(
      ".gen-buy-btn"
    );
    buttons.forEach((btn, i) => {
      const gen = s.generators[i];
      if (gen) {
        const cost = getGeneratorCost(gen);
        btn.disabled = s.entropy < cost;
        const costSpan = btn.parentElement?.querySelector(".gen-cost");
        if (costSpan) costSpan.textContent = formatNumber(cost);
        const ownedSpan = btn.parentElement?.querySelector(".gen-owned");
        if (ownedSpan) ownedSpan.textContent = gen.owned.toString();
        const prodSpan = btn.parentElement?.querySelector(".gen-prod");
        if (prodSpan)
          prodSpan.textContent = formatNumber(gen.production * gen.owned);
      }
    });

    // Prestige
    if (this.game.canPrestige()) {
      this.prestigeBtn.disabled = false;
      this.prestigeInfo.textContent = `Reset for ${this.game.getPrestigeFragments()} Reality Fragments`;
    } else {
      this.prestigeBtn.disabled = true;
      this.prestigeInfo.textContent = `Need ${formatNumber(1_000_000)} entropy to prestige`;
    }

    // Buffs
    this.renderBuffs();

    // Relics
    this.renderRelics();
  }

  private renderGenerators(): void {
    const s = this.game.state;
    this.generatorsContainer.innerHTML = "";
    s.generators.forEach((gen, i) => {
      const cost = getGeneratorCost(gen);
      const div = document.createElement("div");
      div.className = "generator-card";
      div.innerHTML = `
        <div class="gen-header">
          <span class="gen-name">${gen.name}</span>
          <span class="gen-owned">${gen.owned}</span>
        </div>
        <div class="gen-details">
          <span>Production: <span class="gen-prod">${formatNumber(gen.production * gen.owned)}</span>/s</span>
          <span>Cost: <span class="gen-cost">${formatNumber(cost)}</span></span>
        </div>
        <button class="gen-buy-btn" ${s.entropy < cost ? "disabled" : ""}>Buy</button>
      `;
      const btn = div.querySelector(".gen-buy-btn") as HTMLButtonElement;
      btn.addEventListener("click", () => {
        this.game.buyGen(i);
        this.render();
      });
      this.generatorsContainer.appendChild(div);
    });
  }

  private renderLog(): void {
    this.eventLogContainer.innerHTML = this.eventLog
      .map((msg) => `<div class="log-entry">${msg}</div>`)
      .join("");
  }

  private renderBuffs(): void {
    const now = Date.now();
    const s = this.game.state;
    if (s.buffs.length === 0) {
      this.buffsContainer.innerHTML =
        '<span class="empty-text">No active buffs</span>';
      return;
    }
    this.buffsContainer.innerHTML = s.buffs
      .map((b) => {
        const remaining = Math.max(0, (b.endsAt - now) / 1000).toFixed(1);
        return `<div class="buff-tag">${b.name} x${b.multiplier} (${remaining}s)</div>`;
      })
      .join("");
  }

  private renderRelics(): void {
    const s = this.game.state;
    if (s.relics.length === 0) {
      this.relicsContainer.innerHTML =
        '<span class="empty-text">No relics found</span>';
      return;
    }
    this.relicsContainer.innerHTML = s.relics
      .map(
        (r) =>
          `<div class="relic-card rarity-${r.rarity.toLowerCase()}">
            <span class="relic-name">${r.name}</span>
            <span class="relic-rarity">[${r.rarity}]</span>
            <span class="relic-effect">${r.effect} (+${(r.multiplier * 100).toFixed(1)}%)</span>
          </div>`
      )
      .join("");
  }

  private getEl(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el;
  }
}

function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "Q";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}
