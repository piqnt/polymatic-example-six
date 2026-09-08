// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext, Format } from "../model";

/**
 * The one place the runtime talks to the shell.
 *
 * The board keeps writing plain fields on `context.status` many times a frame;
 * once per frame this copies whatever the hud shows onto `context.hud`'s
 * signals. Signals only notify on a real change, so a frame that moves nothing
 * visible re-renders nothing.
 */
export class HudManager extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("frame-render", this.handleFrameRender);
  }

  handleFrameRender = () => {
    const { status, hex, hud } = this.context;

    hud.state.value = status.state;
    hud.score.value = status.currentScore;
    hud.scoreAdded.value = status.newScore;
    hud.topScore.value = status.topScore ?? 0;

    const hasTimer = typeof status.timer === "number" && status.timer >= 0;
    hud.timerText.value = hasTimer ? Format.time(status.timer) : "";

    if (status.state === "gameover") {
      hud.lastScore.value = status.currentScore;
      hud.lastScoreIsTop.value = status.currentScore > 0 && (!status.topScore || status.currentScore > status.topScore);
    }

    // a string rather than the array itself, so an unchanged queue compares
    // equal and the signal stays quiet
    hud.nextTiles.value = hex?.nextTiles?.length ? hex.nextTiles.join("") : "";
  };
}
