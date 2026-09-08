// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import type * as Stage from "stage-js";
import { type Signal, signal } from "@preact/signals";

import { type Hex } from "./Hex";
import { Status } from "./Status";
import { type ScreenConfig } from "./Screen";
import { HudData } from "./Hud";

/**
 * Global context, shared between the runtime and the shell.
 *
 * The plain fields belong to the runtime - the board, the status, the Stage.js
 * nodes - and are written many times a frame. The signals are the bridge: the
 * runtime writes them, the shell subscribes by reading `.value` as it renders.
 * Per-frame readouts go onto `hud` once a frame (runtime/HudManager) rather
 * than being signals at the source, so a still frame re-renders nothing.
 */
export class MainContext {
  stage?: Stage.Root;
  layout?: Stage.Node;

  hex: Hex;
  status: Status;

  // --- shell facing state ---

  /** assets loaded and the stage mounted; the shell draws nothing before this */
  ready: Signal<boolean>;

  /** which screen is up - the shell renders the home menu or the play hud off this */
  screen: Signal<ScreenConfig>;

  hud: HudData;

  constructor() {
    this.status = new Status();

    this.ready = signal(false);
    this.screen = signal<ScreenConfig>({ name: "home" });
    this.hud = new HudData();
  }
}
