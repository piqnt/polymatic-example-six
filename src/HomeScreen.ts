// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

// modes: 1 flip 2 jump 3 slide -1 test

export class HomeScreen extends Middleware<MainContext> {
  container: Stage.Node;

  logo: Stage.Sprite;
  menu: Stage.Node;
  modes: Stage.Sprite[];

  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
  }

  stageScreen = () => {
    if (this.container) return;
    this.container = Stage.maximize();

    this.menu = Stage.column(0.5);
    this.menu.appendTo(this.container);
    this.menu.pin("align", 0.5);

    this.logo = Stage.sprite("logo");
    this.logo.appendTo(this.menu);

    this.modes = [1, 2, 3].map((mode) => {
      const button = Stage.sprite("mode_" + mode);
      button.appendTo(this.menu);
      button.pin("pivot", 0.5);
      button.on(Stage.POINTER_CLICK, () => this.handleClickMode(mode));
      return button;
    });
  };

  handleActivate() {
    this.stageScreen();
    this.container.appendTo(this.context.layout);
    this.animateOpen();
  }

  handleDeactivate = () => {
    this.container.remove();
  };

  handleClickMode = (mode: number) => {
    this.emit("set-screen", { name: "play-" + mode, mode });
  };

  animateOpen = () => {
    // if (this.container.visible()) return;

    this.modes.forEach(function (button, i) {
      button
        .scale(1)
        .tween(120 * i + 150)
        .tween(300)
        .ease("linear-in-out")
        .scale(1.2)
        .tween(300)
        .ease("linear-in-out")
        .scale(1);
    });

    // this.container.show();
  };
}
