// Copyright (c) Ali Shakiba
// Licensed under the MIT License

/**
 * The board's own score and clock. Plain fields: runtime/BoardStatus writes
 * them many times a frame, and runtime/HudManager mirrors what is shown onto
 * the hud signals once per frame.
 */
export class Status {
  state: "idle" | "playing" | "gameover" = "idle";

  topScore = 0;

  currentScore = 0;
  newScore = 0;

  timer: number | null = null;
}
