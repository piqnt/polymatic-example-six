// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import backgroundImage from "../media/background.png";
import tilesImage from "../media/tiles.png";
import menuImage from "../media/menu.png";
import textImage from "../media/text.png";
import logoImage from "../media/logo.png";

import { type MainContext } from "./Main";

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
      image: { src: logoImage, ratio: 4 },
      textures: {
        "logo": { x: 0, y: 0, width: 128, height: 64 },
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
    await Stage.atlas({
      image: { src: menuImage, ratio: 4 },
      textures: {
        "mode_1": { x: 0, y: 0, width: 128, height: 64 },
        "mode_2": { x: 0, y: 64, width: 128, height: 64 },
        "mode_3": { x: 0, y: 128, width: 128, height: 64 },
      },
    });
    await Stage.atlas({
      image: { src: textImage, ratio: 4 },
      textures: {
        "burger": { x: 30 * 0, y: 30, width: 30, height: 30 },
        "reset": [
          { x: 30 * 1, y: 30, width: 30, height: 30 },
          { x: 30 * 2, y: 30, width: 30, height: 30 },
        ],
        "digit": {
          "0": { x: 20 * 0, y: 3, width: 11, height: 15 },
          "1": { x: 20 * 1, y: 3, width: 11, height: 15 },
          "2": { x: 20 * 2, y: 3, width: 13, height: 15 },
          "3": { x: 20 * 3, y: 3, width: 11.5, height: 15 },
          "4": { x: 20 * 4, y: 3, width: 12.5, height: 15 },
          "5": { x: 20 * 5, y: 3, width: 12, height: 15 },
          "6": { x: 20 * 6, y: 3, width: 12, height: 15 },
          "7": { x: 20 * 7, y: 3, width: 15, height: 15 },
          "8": { x: 20 * 8, y: 3, width: 11, height: 15 },
          "9": { x: 20 * 9, y: 3, width: 10, height: 15 },
          "-": { x: 20 * 10, y: 3, width: 11, height: 15 },
          "+": { x: 20 * 11, y: 3, width: 10, height: 15 },
          ":": { x: 20 * 12, y: 3, width: 6, height: 15 },
          "s": { x: 200, y: 33, width: 18, height: 15 },
          "S": { x: 220, y: 33, width: 18, height: 15 },
        },
      },
    });
    this.context.stage = Stage.mount();
    this.emit("stage-loaded");
  };
}
