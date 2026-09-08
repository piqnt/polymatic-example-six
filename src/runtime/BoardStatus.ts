// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext, Status } from "../model";
import { type FrameLoopEvent } from "./FrameLoop";

export class BoardStatus extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("frame-update", this.handleFrameUpdate);

    this.on("board-add-score", this.handleAddScore);
    this.on("board-set-score", this.handleSetScore);
    this.on("board-set-timer", this.handleSetTimer);

    this.on("game-start", this.handleGameStart);
    this.on("game-end", this.handleGameEnd);
  }

  handleActivate = () => {
    this.context.status = new Status();
  };

  handleFrameUpdate = (e: FrameLoopEvent) => {
    const status = this.context.status;
    if (typeof status.timer === "number" && status.timer > 0) {
      status.timer = Math.max(0, status.timer - e.dt);
      if (status.timer <= 0) {
        this.emit("board-time-over");
      }
    }
  };

  handleGameStart = () => {
    this.context.status.state = "playing";
    this.context.status.currentScore = 0;
    // this.context.status.timer = -1;
  };

  handleGameEnd = () => {
    this.context.status.state = "gameover";
    this.context.status.newScore = 0;
  };

  handleSetTimer = (timer: number) => {
    this.context.status.timer = timer * 1000;
  };

  handleAddScore = (add: number) => {
    this.handleSetScore(this.context.status.currentScore + add);
  };

  handleSetScore = (score: number) => {
    const status = this.context.status;
    const change = score - status.currentScore;
    status.currentScore = score;
    status.newScore = change;
  };
}
