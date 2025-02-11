// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

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
} from "./Hex";
import { runTask, stepTimeline, timeoutTask } from "./Timeline";
import { type FrameLoopEvent } from "./FrameLoop";

const SAVE_KEY = "colorlines";

export class BoardJump extends Middleware<MainContext> {
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
    this.context.hex = new Hex();
    this.emit("disk-load-game");
    // delay for loading game from disk
    runTask(this.context.hex, [timeoutTask(() => this.startGame(), 50)]);
  }

  handleFrameUpdate = (ev: FrameLoopEvent) => {
    stepTimeline(this.context.hex, ev.dt);
  };

  handleReset = () => {
    teardownHex(this.context.hex);
    this.emit("disk-remove-game");
    this.startGame();
  };

  startGame = () => {
    // check if already inited (loaded from disk)
    if (!this.context.hex.inited) {
      setupHex(this.context.hex, 4);
      this.addTiles();
    }
    this.emit("game-start");
  };

  endGame() {
    teardownHex(this.context.hex);
    this.emit("disk-remove-game");
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

  handlePointerUp = (point: Point) => {
    if (this.context.hex.locked) return;

    if (!this.src) return;

    const cell = nearestCell(this.context.hex, point.x, point.y);
    if (!cell || cell.tile) return;

    if (this.src.tile) {
      this.src.tile.selected = false;
    }

    // if (this.findPath(this.src, cell)) {
    relocateTile(this.context.hex, cell, this.src, false);
    runTask(this.context.hex, [timeoutTask(() => this.matchBoard(true), 200)]);
    // }
    this.src = null;
  };

  matchBoard = (userMove?: boolean) => {
    const matchedNumber = matchRow(this.context.hex, 4);

    if (matchedNumber) {
      this.emit("board-add-score", matchedNumber);
    }

    const filled = filledCells(this.context.hex);
    const empty = emptyCells(this.context.hex);

    if (!empty.length) {
      // game over
      runTask(this.context.hex, [timeoutTask(() => this.endGame(), 500)]);
    } else if (!filled.length) {
      // board is empty
      runTask(this.context.hex, [timeoutTask(() => this.addTiles(), matchedNumber ? 300 : 0)]);
    } else if (userMove && !matchedNumber) {
      // user made a move, but no match
      runTask(this.context.hex, [timeoutTask(() => this.addTiles(), 300)]);
    } else {
      this.emit("disk-save-game");
    }
  };

  addTiles = () => {
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
    runTask(this.context.hex, [timeoutTask(() => this.matchBoard(), 400)]);
  };
}
