// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { Tile, cellAt, assignTile } from "./Hex";

interface GameV2 {
  score?: number;
  cells: { i: number; j: number; color: string }[];
  queue?: string[];
}

const HIGHSCORE_V2 = "six-top-score-v2-";
const GAME_V2 = "six-save-game-v2-";

export class Save extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("game-start", this.handleGameStart);
    this.on("game-end", this.handleGameEnd);

    this.on("disk-save-game", this.saveGame);
    this.on("disk-load-game", this.loadGame);
    this.on("disk-remove-game", this.dropGame);
  }

  handleGameStart = () => {
    const mode = this.context.screen.mode;
    const status = this.context.status;
    const highScore = this.loadHighScore(mode);
    if (highScore > 0) {
      status.topScore = highScore;
    }
  };

  handleGameEnd = () => {
    const mode = this.context.screen.mode;
    const status = this.context.status;
    if (status.currentScore > 0 && status.currentScore > status.topScore) {
      this.saveHighScore(mode, status.currentScore);
    }
  };

  saveHighScore = (mode: number, score: number) => {
    const key = HIGHSCORE_V2 + mode;
    try {
      localStorage.setItem(key, String(score));
    } catch (e) {
      console.log(e);
    }
  };

  loadHighScore = (mode: number) => {
    const key = HIGHSCORE_V2 + mode;
    try {
      const value = +localStorage.getItem(key);
      if (value > 0) return value;
    } catch (e) {
      console.error(e);
    }
    return 0;
  };

  saveGame = () => {
    const mode = this.context.screen.mode;
    const key = GAME_V2 + mode;

    try {
      const json: GameV2 = {
        score: this.context.status.currentScore,
        queue: this.context.hex.nextTiles ?? undefined,
        cells: this.context.hex.cells.map((cell) => ({
          i: cell.i,
          j: cell.j,
          color: cell.tile?.color ?? undefined,
        })),
      };
      console.debug(json);
      const string = JSON.stringify(json);
      localStorage.setItem(key, string);
    } catch (e) {
      console.log(e);
    }
  };

  loadGame = () => {
    const mode = this.context.screen.mode;
    const key = GAME_V2 + mode;

    try {
      const stringGame = localStorage.getItem(key);
      // console.debug(game);
      if (!stringGame) return false;

      const json: GameV2 = JSON.parse(stringGame);
      this.context.status.currentScore = json.score;
      json.cells.forEach((data) => {
        const cell = cellAt(this.context.hex, data.i, data.j, true);
        if (data.color) {
          const tile = new Tile(data.color);
          assignTile(this.context.hex, cell, tile);
        }
      });
      if (json.queue) {
        this.context.hex.nextTiles = json.queue;
      }

      this.context.hex.inited = true;

      return true;
    } catch (e) {
      console.log(e);
    }
    return false;
  };

  dropGame = () => {
    const mode = this.context.screen.mode;
    const key = GAME_V2 + mode;

    localStorage.removeItem(key);
  };
}
