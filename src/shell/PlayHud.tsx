// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { TbMenu2, TbRefresh, TbTrophy } from "react-icons/tb";

import { useRuntime } from "./context";
import { goHome, resetPlay } from "./actions";
import { atlasStyle, tile } from "./atlas";
import styles from "./Shell.module.css";

/** Everything drawn around the board: score, clock, queue, and the two buttons. */
export function PlayHud() {
  const runtime = useRuntime();
  const hud = runtime.context.hud;
  const over = hud.state.value === "gameover";

  return (
    <>
      <span class={styles.score}>{hud.score.value}</span>
      <ScoreAdded />
      <Timer />
      <NextTiles />
      {over && <LastScore />}
      <TopScore />

      <button
        type="button"
        class={`${styles.iconButton} ${styles.homeButton}`}
        aria-label="Back to menu"
        onClick={() => goHome(runtime)}
      >
        <TbMenu2 aria-hidden size="1em" />
      </button>
      <button
        type="button"
        class={`${styles.iconButton} ${styles.resetButton} ${over ? styles.resetUrgent : ""}`}
        aria-label="Play again"
        onClick={() => resetPlay(runtime)}
      >
        <TbRefresh aria-hidden size="1em" />
      </button>
    </>
  );
}

function ScoreAdded() {
  const { scoreAdded } = useRuntime().context.hud;
  const value = scoreAdded.value;
  if (!value) return null;
  return <span class={styles.scoreAdded}>{value > 0 ? `+${value}` : value}</span>;
}

function Timer() {
  const { timerText } = useRuntime().context.hud;
  const text = timerText.value;
  if (!text) return null;
  return <span class={styles.timer}>{text}</span>;
}

/** The colors queued to come next, drawn as the board's own tile sprites. */
function NextTiles() {
  const { nextTiles } = useRuntime().context.hud;
  const colors = nextTiles.value;
  if (!colors) return null;

  return (
    <span class={styles.nextTiles}>
      {colors.split("").map((color, i) => (
        <span key={i} class={styles.tile} style={atlasStyle("tiles", tile(color), 0.4)} />
      ))}
    </span>
  );
}

/**
 * What the finished game scored, with a trophy if it beat the best. The sprite
 * hud marked that with an S glyph out of its own font, which the DOM cannot
 * draw, so the icon stands in for it.
 */
function LastScore() {
  const { lastScore, lastScoreIsTop } = useRuntime().context.hud;
  return (
    <span class={styles.lastScore}>
      {lastScore.value}
      {lastScoreIsTop.value && (
        <span class={styles.best} aria-label="New best">
          <TbTrophy aria-hidden size="1em" />
        </span>
      )}
    </span>
  );
}

function TopScore() {
  const { topScore } = useRuntime().context.hud;
  if (!topScore.value) return null;
  return (
    <span class={styles.topScore} aria-label="Best score">
      <TbTrophy aria-hidden size="1em" />
      <span>{topScore.value}</span>
    </span>
  );
}
