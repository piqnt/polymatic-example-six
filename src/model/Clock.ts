// Copyright (c) Ali Shakiba
// Licensed under the MIT License

interface Wait {
  remaining: number;
  resolve: () => void;
}

/**
 * Waits for game time, to pace animated sequences written as async functions.
 *
 * Time advances with `step`, called with the frame loop's dt, so waits pause with the game.
 * A wait resolves on the first frame after its time has passed.
 */
export class Clock {
  private waits: Wait[] = [];

  /** Resolves after `ms` of game time */
  wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.waits.push({ remaining: ms, resolve }));
  }

  step(dt: number) {
    if (!this.waits.length) return;
    const waits = this.waits;
    this.waits = [];
    for (const wait of waits) {
      wait.remaining -= dt;
      if (wait.remaining < 0) {
        wait.resolve();
      } else {
        this.waits.push(wait);
      }
    }
  }

  /** A sequence is still playing */
  busy() {
    return this.waits.length > 0;
  }

  /** Drop all pending waits, so sequences waiting on them never continue */
  clear() {
    this.waits.length = 0;
  }
}
