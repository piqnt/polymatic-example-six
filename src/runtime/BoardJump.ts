// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "../model";

import { BoardStatus } from "./BoardStatus";
import {
  type Point,
  Cell,
  Hex,
  relocateTile,
  nearestCell,
  matchRow,
  teardownHex,
  setupHex,
  filledCells,
  emptyCells,
  fillSome,
} from "../model";
import { Clock } from "../model";
import { type FrameLoopEvent } from "./FrameLoop";

const SAVE_KEY = "colorlines";

export class BoardJump extends Middleware<MainContext> {
  /** paces the animated sequences; waits are dropped on reset, so those sequences stop */
  clock = new Clock();

  src: Cell;

  constructor() {
    super();
    this.on("activate", this.handleActivate);

    this.on("user-pointer-down", this.handlePointerDown);
    this.on("user-pointer-up", this.handlePointerUp);
    this.on("user-reset-play", this.handleReset);

    this.on("frame-update", this.handleFrameUpdate);

    this.use(new BoardStatus());
  }

  handleActivate() {
    this.clock.clear();
    this.context.hex = new Hex();
    this.startGame();
  }

  handleFrameUpdate = (ev: FrameLoopEvent) => {
    this.clock.step(ev.dt);
  };

  handleReset = () => {
    this.clock.clear();
    teardownHex(this.context.hex);
    this.context.store?.dropGame();
    this.startGame();
  };

  /** Continue the saved game if there is one, or start a new one */
  startGame = () => {
    const saved = this.context.store?.loadGame();
    if (!saved) {
      setupHex(this.context.hex, 4);
      this.addTiles();
    }
    this.emit("game-start", { score: saved?.score ?? 0 });
  };

  endGame() {
    this.clock.clear();
    teardownHex(this.context.hex);
    this.context.store?.dropGame();
    this.emit("game-end");
  }

  handlePointerDown = (point: Point) => {
    if (this.context.hex.locked) return;

    const cell = nearestCell(this.context.hex, point.x, point.y);
    if (!cell) {
      if (this.src) {
        if (this.src.tile) {
          this.src.tile.selected = false;
        }
        this.src = null;
      }
    } else if (cell.tile) {
      if (!this.src) {
        this.src = cell;
        if (this.src.tile) {
          this.src.tile.selected = true;
        }
      } else if (this.src == cell) {
        // if (this.src.tile) {
        //   this.src.tile.selected = false;
        // }
        // this.src = null;
      } else {
        if (this.src.tile) {
          this.src.tile.selected = false;
        }
        this.src = cell;
        if (this.src.tile) {
          this.src.tile.selected = true;
        }
      }
    }
  };

  handlePointerUp = async (point: Point) => {
    if (this.context.hex.locked) return;

    if (!this.src) return;

    const cell = nearestCell(this.context.hex, point.x, point.y);
    if (!cell || cell.tile) return;

    if (this.src.tile) {
      this.src.tile.selected = false;
    }

    // if (this.findPath(this.src, cell)) {
    relocateTile(this.context.hex, cell, this.src, false);
    // }
    this.src = null;
    await this.clock.wait(200);
    this.matchBoard(true);
  };

  matchBoard = async (userMove?: boolean) => {
    const matchedNumber = matchRow(this.context.hex, 4);

    if (matchedNumber) {
      this.emit("board-add-score", matchedNumber);
    }

    const filled = filledCells(this.context.hex);
    const empty = emptyCells(this.context.hex);

    if (!empty.length) {
      // game over
      await this.clock.wait(500);
      this.endGame();
    } else if (!filled.length) {
      // board is empty
      await this.clock.wait(matchedNumber ? 300 : 0);
      this.addTiles();
    } else if (userMove && !matchedNumber) {
      // user made a move, but no match
      await this.clock.wait(300);
      this.addTiles();
    } else {
      this.context.store?.saveGame();
    }
  };

  addTiles = async () => {
    let score = this.context.status.currentScore;
    let n: number;
    if (score < 60) {
      n = 3;
    } else if (score < 60 * 2) {
      n = 4;
    } else if (score < 60 * 4) {
      n = 5;
    } else if (score < 60 * 7) {
      n = 6;
    } else if (score < 60 * 12) {
      n = 7;
    } else {
      n = 8;
    }
    fillSome(this.context.hex, n, true);
    await this.clock.wait(400);
    this.matchBoard();
  };
}
