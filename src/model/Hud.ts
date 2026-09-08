// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type Signal, signal } from "@preact/signals";

/**
 * Everything the play hud draws, mirrored out of the board's status once per
 * frame by runtime/HudManager. The shell reads only these - it never reaches
 * into the hex board or the status itself.
 */
export class HudData {
  state: Signal<"idle" | "playing" | "gameover">;

  score: Signal<number>;
  /** the last change to the score, drawn as a +n / -n next to it; 0 hides it */
  scoreAdded: Signal<number>;

  /** the countdown, already formatted; "" when this mode has no clock */
  timerText: Signal<string>;

  /** 0 when this mode has no score to beat yet */
  topScore: Signal<number>;

  /** the score the finished game ended on, and whether it beat the best */
  lastScore: Signal<number>;
  lastScoreIsTop: Signal<boolean>;

  /** the colors queued to come next, as the tile letters the atlas is keyed by */
  nextTiles: Signal<string>;

  constructor() {
    this.state = signal<"idle" | "playing" | "gameover">("idle");

    this.score = signal(0);
    this.scoreAdded = signal(0);

    this.timerText = signal("");

    this.topScore = signal(0);

    this.lastScore = signal(0);
    this.lastScoreIsTop = signal(false);

    this.nextTiles = signal("");
  }
}
