// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { PlayModes } from "../model";
import { useRuntime } from "./context";
import { playMode } from "./actions";
import styles from "./Shell.module.css";

/** The menu: the title, and a card per mode saying how that one is played. */
export function HomePage() {
  const runtime = useRuntime();

  return (
    <div class={styles.menu}>
      <h1 class={styles.logo}>Hex-a-Lot</h1>

      {PlayModes.map(({ mode, name, about }) => (
        <button
          key={mode}
          type="button"
          class={styles.modeCard}
          aria-label={name}
          onClick={() => playMode(runtime, mode)}
        >
          <span class={styles.modeName}>{name}</span>
          <span class={styles.modeAbout}>{about}</span>
        </button>
      ))}
    </div>
  );
}
