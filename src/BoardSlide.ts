// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

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
} from "./Hex";
import { runTask, stepTimeline, timeoutTask } from "./Timeline";
import { type FrameLoopEvent } from "./FrameLoop";

const TIME = 60;

export class BoardSlide extends Middleware<MainContext> {
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
    this.context.hex = new Hex();
    this.startGame();
  }

  handleFrameUpdate = (ev: FrameLoopEvent) => {
    stepTimeline(this.context.hex, ev.dt);
  };

  handleReset = () => {
    teardownHex(this.context.hex);
    this.startGame();
  };

  handleTimeover = () => {
    this.endGame();
  };

  startGame = () => {
    this.cancelPointer();
    setupHex(this.context.hex, 3);
    runTask(this.context.hex, [timeoutTask(() => fillUp(this.context.hex), 150)]);
    this.emit("board-set-timer", TIME);
    this.emit("game-start");
    // this.status.setScore(this.cells.length);
  };

  endGame() {
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

  matchBoard = () => {
    const removed = matchRow(this.context.hex, 3);
    if (removed) {
      // let t = Date.now() - this.status.start;
      // let time = removed * 20 * 1000 / (t / 1000 + 30);
      // this.emit("extend-timer", time);
      this.emit("board-add-score", removed /*, !this.cellDown */);
      runTask(this.context.hex, [
        timeoutTask(() => fillUp(this.context.hex), 150),
        timeoutTask(() => this.matchBoard(), 150),
      ]);
    }
  };
}
