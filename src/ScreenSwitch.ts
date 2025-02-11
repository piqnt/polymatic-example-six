// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

export interface ScreenConfig {
  name: string;
  [key: string]: any;
}

export type ScreenMap = Record<string, Middleware<any>>;

export interface ScreenSwitchContext {
  screen: ScreenConfig;
}

export class ScreenSwitch extends Middleware<ScreenSwitchContext> {
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
    this.setContext((context) => {
      context.screen = config;
    });
    this._swap([middleware]);
  };
}
