// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import tilesImage from "../../media/tiles.png";

/**
 * Draws a sprite out of the same atlases the game renders from, as a css
 * background - so the logo, the mode buttons and the tile chips in the DOM are
 * the artwork itself, not a lookalike.
 *
 * Coordinates are the atlas's own, exactly as runtime/Loader names them. Each
 * png is declared there with `ratio: 4`, so a sprite that measures w x h in
 * atlas units is 4w x 4h pixels; setting `background-size` to a quarter of the
 * image scales the whole sheet back down to atlas units.
 */
const RATIO = 4;

interface Sheet {
  url: string;
  /** the png's own pixel size */
  width: number;
  height: number;
}

const sheets = {
  tiles: { url: tilesImage, width: 1024, height: 128 },
} satisfies Record<string, Sheet>;

export type SheetName = keyof typeof sheets;

export interface AtlasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function atlasStyle(sheet: SheetName, rect: AtlasRect, scale = 1) {
  const { url, width, height } = sheets[sheet];
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${(width / RATIO) * scale}px ${(height / RATIO) * scale}px`,
    backgroundPosition: `-${rect.x * scale}px -${rect.y * scale}px`,
    backgroundRepeat: "no-repeat",
    width: `${rect.width * scale}px`,
    height: `${rect.height * scale}px`,
  };
}

// the rects below are the same ones runtime/Loader declares

/** one of the six tile colors, keyed the way the board names them */
export const tile = (color: string): AtlasRect => {
  const order = ["r", "g", "b", "y", "p", "x"];
  const index = Math.max(0, order.indexOf(color));
  return { x: index * 30, y: 0, width: 30, height: 30 };
};
