// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import backgroundImage from "../../media/background.png";
import tilesImage from "../../media/tiles.png";

import { type MainContext } from "../model";

export class Loader extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  handleActivate = async () => {
    await Stage.atlas({
      image: { src: backgroundImage },
      textures: {
        "background": { x: 0, y: 0, width: 512, height: 512 },
      },
    });
    await Stage.atlas({
      image: { src: tilesImage, ratio: 4 },
      textures: {
        "cell": { x: 30 * 6, y: 0, width: 30, height: 30 },
        "tile_r": { x: 30 * 0, y: 0, width: 30, height: 30 },
        "tile_g": { x: 30 * 1, y: 0, width: 30, height: 30 },
        "tile_b": { x: 30 * 2, y: 0, width: 30, height: 30 },
        "tile_y": { x: 30 * 3, y: 0, width: 30, height: 30 },
        "tile_p": { x: 30 * 4, y: 0, width: 30, height: 30 },
        "tile_x": { x: 30 * 5, y: 0, width: 30, height: 30 },
        "tile": {
          "r": "tile_r",
          "g": "tile_g",
          "b": "tile_b",
          "y": "tile_y",
          "p": "tile_p",
          "x": "tile_x",
        },
      },
    });
    this.context.stage = Stage.mount();
    this.emit("stage-loaded");
  };
}
