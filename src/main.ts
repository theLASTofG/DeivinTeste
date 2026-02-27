import { Game } from "./game/Game";
import { UI } from "./ui/UI";

let ui: UI | null = null;
const pendingMessages: string[] = [];

const game = new Game((msg: string) => {
  if (ui) {
    ui.addLogEntry(msg);
  } else {
    pendingMessages.push(msg);
  }
});

ui = new UI(game);

document.addEventListener("DOMContentLoaded", () => {
  ui!.init();
  for (const msg of pendingMessages) {
    ui!.addLogEntry(msg);
  }
  pendingMessages.length = 0;
  game.start();
});
