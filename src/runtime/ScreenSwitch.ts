// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext, type ScreenConfig } from "../model";

export type ScreenMap = Record<string, Middleware<any>>;

/**
 * Swaps in the middleware that runs the named screen, and publishes the choice
 * on `context.screen` so the shell knows which page to draw.
 *
 * The home screen is a Preact page (shell/HomePage) with nothing behind it, so
 * it maps to an empty middleware here.
 */
export class ScreenSwitch extends Middleware<MainContext> {
  screens: ScreenMap;

  constructor(screens: ScreenMap) {
    super();
    this.screens = screens;
    this.on("set-screen", this.handleSetScreen);
  }

  handleSetScreen = (config: ScreenConfig) => {
    const name = config.name;
    const middleware = this.screens[name];

    if (!middleware) {
      console.error("Unknown screen", name);
      return;
    }
    this.context.screen.value = config;
    this._swap([middleware]);
  };
}
