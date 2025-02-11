// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import { type MainContext } from "./Main";

export class Resize extends Middleware<MainContext> {
  background: Stage.Sprite;

  constructor() {
    super();
    this.on("stage-loaded", this.handleStageLoaded);
  }

  handleStageLoaded() {
    // stage.background("#222");

    this.background = Stage.sprite("background");
    this.background.appendTo(this.context.stage);
    this.background.pin("align", 0.5);
    this.background.pin("handle", 0.5);

    this.context.layout = Stage.component();
    this.context.layout.appendTo(this.context.stage);
    this.context.layout.pin("align", 0.5);
    this.context.layout.size(200, 300);

    this.context.stage.on("viewport", this.handleViewport);

    this.handleViewport();

    this.emit("set-screen", { name: "home" });
  }

  handleViewport = () => {
    const viewport = this.context.stage.viewport();

    this.background.fit(viewport.width, viewport.height, "out");

    // max scaled size
    const heightMax = Math.min(650 * viewport.ratio, viewport.height);
    const widthMax = Math.min(600 * viewport.ratio, viewport.width, heightMax);

    this.context.layout.fit(widthMax, heightMax, "contain");
  };
}
