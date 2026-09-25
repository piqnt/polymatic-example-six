// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "../model";

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
} from "../model";
import { Clock } from "../model";
import { type FrameLoopEvent } from "./FrameLoop";

const TIME = 60;

export class BoardFlip extends Middleware<MainContext> {
  /** paces the animated sequences; waits are dropped on reset, so those sequences stop */
  clock = new Clock();

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
    this.clock.clear();
    this.context.hex = new Hex();
    this.startGame();
  };

  handleReset = () => {
    this.clock.clear();
    teardownHex(this.context.hex);
    this.startGame();
  };

  handleFrameUpdate = (ev: FrameLoopEvent) => {
    this.clock.step(ev.dt);
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
    this.clock.clear();
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
      this.collapseAndFill();
    } else if (matched.length == 1) {
      this.emit("board-add-score", -10);
      matched[0].tile.color = Color.x;
    }
  };

  /** counts collapse-and-fill sequences, so an older one can tell it was superseded */
  sequence = 0;

  /**
   * Tiles fall into the gaps, then new tiles fill the board. Both act on the whole board, so a
   * newer tap's sequence covers this one's gaps too, and this one stops at its next step.
   */
  collapseAndFill = async () => {
    const sequence = ++this.sequence;
    await this.clock.wait(50);
    if (sequence !== this.sequence) return;
    collapseHex(this.context.hex, 1);
    await this.clock.wait(150);
    if (sequence !== this.sequence) return;
    fillUp(this.context.hex);
  };
}
