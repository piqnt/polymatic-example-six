// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

import { BoardStatus } from "./BoardStatus";
import {
  collapseHex,
  Color,
  fillUp,
  Hex,
  matchAdjacent,
  nearestCell,
  setupHex,
  teardownHex,
  unassignTile,
  type Point,
} from "./Hex";
import { runTask, stepTimeline, timeoutTask } from "./Timeline";
import { type FrameLoopEvent } from "./FrameLoop";

const TIME = 60;

export class BoardFlip extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);

    this.on("board-time-over", this.handleTimeover);

    this.on("user-pointer-down", this.handlePointerDown);
    this.on("user-reset-play", this.handleReset);

    this.on("frame-update", this.handleFrameUpdate);

    this.use(new BoardStatus());
  }

  handleActivate = () => {
    this.context.hex = new Hex();
    this.startGame();
  };

  handleReset = () => {
    teardownHex(this.context.hex);
    this.startGame();
  };

  handleFrameUpdate = (ev: FrameLoopEvent) => {
    stepTimeline(this.context.hex, ev.dt);
  };

  handleTimeover = () => {
    this.endGame();
  };

  startGame = () => {
    setupHex(this.context.hex, 4);
    fillUp(this.context.hex);
    this.emit("board-set-timer", TIME);
    this.emit("game-start");
  };

  endGame = () => {
    teardownHex(this.context.hex);
    this.emit("game-end");
  };

  handlePointerDown = (point: Point) => {
    if (this.context.hex.locked) return;

    const cell = nearestCell(this.context.hex, point.x, point.y);
    if (!cell) return;

    let matched = matchAdjacent(this.context.hex, cell);
    if (matched.length > 1) {
      this.emit("board-add-score", matched.length);
      matched.forEach((cell) => {
        unassignTile(this.context.hex, cell, true);
      });
      runTask(this.context.hex, [
        timeoutTask(() => collapseHex(this.context.hex, 1), 50, ""),
        timeoutTask(() => fillUp(this.context.hex), 150, ""),
      ]);
    } else if (matched.length == 1) {
      this.emit("board-add-score", -10);
      matched[0].tile.color = Color.x;
    }
  };
}
