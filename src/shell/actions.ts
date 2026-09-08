// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type GameRuntime } from "./context";

// Everything a control can do, in one file. Components call these; they never
// emit an event or set a signal inline.

/** @action */
export function playMode({ emit }: GameRuntime, mode: number) {
  emit("set-screen", { name: "play-" + mode, mode });
}

/** @action */
export function goHome({ emit }: GameRuntime) {
  emit("set-screen", { name: "home" });
}

/** @action */
export function resetPlay({ emit }: GameRuntime) {
  emit("user-reset-play");
}
