// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";
import { effect } from "@preact/signals";

import { type MainContext, type ScreenConfig } from "../model";

interface Case {
  name: string;
  middleware: Middleware<any>;
}

/**
 * Runs the play screen named by `context.screen`, and sets it on "set-screen". The shell draws
 * the page for `context.screen` too.
 *
 * Screens are added as cases, see Main. Only the current screen is in the tree, so the others
 * neither run nor receive events.
 */
export class ScreenSwitch extends Middleware<MainContext> {
  private cases: Case[] = [];
  private dispose: (() => void) | null = null;

  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
    this.on("set-screen", this.handleSetScreen);
  }

  /**
   * Add a screen. The switch's context must provide what the screen needs. A screen added while
   * the switch is active is used right away if it is current.
   */
  case<T>(this: ScreenSwitch & Middleware<NoInfer<T>>, name: string, middleware: Middleware<T>): ScreenSwitch {
    this.cases.push({ name, middleware });
    // the effect only runs again when the screen changes
    if (this.activated && this.context.screen.value?.name === name) {
      (this as Middleware<any>).use(middleware);
    }
    return this;
  }

  handleSetScreen = (config: ScreenConfig) => {
    this.context.screen.value = config;
  };

  handleActivate = () => {
    this.dispose = effect(() => {
      const name = this.context.screen.value?.name;
      // remove the previous screen before using the next, since screens share the context
      for (const c of this.cases) {
        if (c.name !== name) {
          this.unuse(c.middleware);
        }
      }
      for (const c of this.cases) {
        if (c.name === name) {
          (this as Middleware<any>).use(c.middleware);
        }
      }
    });
  };

  handleDeactivate = () => {
    this.dispose?.();
    this.dispose = null;
    for (const c of this.cases) {
      this.unuse(c.middleware);
    }
  };
}
