// Copyright (c) Ali Shakiba
// Licensed under the MIT License

/**
 * Saves the game in progress for the current mode, so it can be continued later.
 *
 * Registered on the context by runtime/Save while it is activated.
 */
export interface GameStore {
  /** Put the saved game's tiles on the board; returns its score, or null if nothing was saved */
  loadGame(): { score: number } | null;

  saveGame(): void;

  dropGame(): void;
}
