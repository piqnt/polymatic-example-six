// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import "./fonts.css";

import { GameContext } from "./context";
import { runtime } from "../async-signals";
import { HomePage } from "./HomePage";
import { PlayHud } from "./PlayHud";
import styles from "./Shell.module.css";

/**
 * The shell. It mounts before the runtime exists (see index.tsx), so every read
 * below is guarded: `runtime` fills in once the game has been activated, and
 * `ready` once the atlases are loaded and the stage is mounted.
 */
export function App() {
  const context = runtime.value?.context;
  const ready = context?.ready.value;
  const screen = context?.screen.value;
  const home = screen?.name === "home";

  return (
    <GameContext.Provider value={runtime.value ?? null}>
      <div class={styles.frame}>
        {runtime.value && ready && home && <HomePage />}
        {runtime.value && ready && !home && <PlayHud />}
      </div>
    </GameContext.Provider>
  );
}
