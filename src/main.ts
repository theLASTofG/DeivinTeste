import { Game } from "./game/Game";
import { UI } from "./ui/UI";

const game = new Game((msg: string) => {
  ui.addLogEntry(msg);
});

const ui = new UI(game);

document.addEventListener("DOMContentLoaded", () => {
  ui.init();
  game.start();
});
