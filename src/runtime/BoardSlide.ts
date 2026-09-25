// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "../model";

import { BoardStatus } from "./BoardStatus";
import {
  Hex,
  Cell,
  Direction,
  fillUp,
  matchRow,
  nearestCell,
  rotateRow,
  setupHex,
  teardownHex,
  type Point,
} from "../model";
import { Clock } from "../model";
import { type FrameLoopEvent } from "./FrameLoop";

const TIME = 60;

export class BoardSlide extends Middleware<MainContext> {
  /** paces the animated sequences; waits are dropped on reset, so those sequences stop */
  clock = new Clock();

  pointDown: Point | null;
  cellDown: Cell | null;
  dirLock: number | null;

  constructor() {
    super();
    this.on("activate", this.handleActivate);

    this.on("board-time-over", this.handleTimeover);

    this.on("user-pointer-down", this.handlePointerDown);
    this.on("user-pointer-move", this.handlePointerMove);
    this.on("user-pointer-up", this.handlePointerUp);
    this.on("user-pointer-cancel", this.handlePointerCancel);

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
    this.startGame();
  };

  handleTimeover = () => {
    this.endGame();
  };

  startGame = () => {
    this.cancelPointer();
    setupHex(this.context.hex, 3);
    this.refill();
    this.emit("board-set-timer", TIME);
    this.emit("game-start");
    // this.status.setScore(this.cells.length);
  };

  endGame() {
    this.clock.clear();
    this.cancelPointer();
    teardownHex(this.context.hex);
    this.emit("game-end");
  }

  handlePointerDown = (point: Point) => {
    if (this.context.hex.locked) return;

    this.pointDown = { x: point.x, y: point.y };
    this.cellDown = nearestCell(this.context.hex, point.x, point.y);
    this.dirLock = null;
  };

  handlePointerMove = (point: Point) => {
    if (this.context.hex.locked) return;
    if (!this.cellDown) return;

    const dx = point.x - this.pointDown.x;
    const dy = point.y - this.pointDown.y;
    const d = dx * dx + dy * dy;

    if (this.dirLock == null && d >= 0.25) {
      this.dirLock = Direction.fromXY(dx, dy);
    }

    if (this.dirLock !== null) {
      const xy = Direction.get_xy(this.dirLock);
      const dist = xy.x * dx + xy.y * dy;
      const round = Math.round(dist);
      if (round !== 0) {
        this.pointDown.x = point.x;
        this.pointDown.y = point.y;
        rotateRow(this.context.hex, this.cellDown, this.dirLock, round);
      }
    }
  };

  handlePointerUp = (point: Point) => {
    if (this.context.hex.locked) return;
    this.cellDown = null;
    this.dirLock = null;
    this.matchBoard();
  };

  handlePointerCancel = () => {
    this.cancelPointer();
  };

  cancelPointer = () => {
    this.pointDown = null;
    this.cellDown = null;
    this.dirLock = null;
  };

  /** New tiles fill the board, after a moment */
  refill = async () => {
    await this.clock.wait(150);
    fillUp(this.context.hex);
  };

  /** counts cascades, so an older one can tell it was superseded */
  sequence = 0;

  /**
   * Remove rows of three, refill, and repeat while new rows form. Refilling acts on the whole
   * board, so a newer cascade covers this one's gaps too, and this one stops at its next step.
   */
  matchBoard = async (sequence?: number) => {
    const removed = matchRow(this.context.hex, 3);
    if (!removed) return;
    sequence ??= ++this.sequence;
    // let t = Date.now() - this.status.start;
    // let time = removed * 20 * 1000 / (t / 1000 + 30);
    // this.emit("extend-timer", time);
    this.emit("board-add-score", removed /*, !this.cellDown */);
    await this.clock.wait(150);
    if (sequence !== this.sequence) return;
    fillUp(this.context.hex);
    await this.clock.wait(150);
    if (sequence !== this.sequence) return;
    this.matchBoard(sequence);
  };
}
