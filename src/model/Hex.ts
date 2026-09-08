// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { nanoid } from "nanoid";

export interface Point {
  x: number;
  y: number;
}

export class Tile {
  key = "tile-" + nanoid(8);
  type = "tile";

  color: string;

  selected = false;

  collected = false;
  slide = false;
  jump = false;

  cell: Cell;

  constructor(color: string) {
    this.color = color;
  }
}

export class Cell {
  key = "cell-" + nanoid(8);
  type = "cell";

  flag: number;

  // index
  i: number;
  j: number;

  // position
  x: number;
  y: number;

  tile: Tile | null;
  hidden: boolean;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.x = i * Math.sin(Math.PI / 3);
    this.y = j + i / 2;
  }

  isColored = () => {
    return this.tile && this.tile.color && this.tile.color != Color.x;
  };
}

export class Hex {
  cellMap: Record<string, Cell> = {};
  cells?: Cell[] = [];
  tiles?: Tile[] = [];

  inited = false;
  locked = false;
  nextTiles?: string[];

  timeline = [];
}

export const setupHex = (hex: Hex, radius: number) => {
  hex.inited = true;
  hex.cellMap = {};
  hex.cells = [];
  hex.tiles = [];

  let cells: Cell[] = [];
  cells.push(cellAt(hex, 0, 0, true));
  const next: Cell[] = [];
  range(radius - 1).forEach(() => {
    cells.forEach((cell) => {
      Direction.ij.forEach((ij) => {
        const i = cell.i + ij.i;
        const j = cell.j + ij.j;
        if (!cellAt(hex, i, j)) {
          next.push(cellAt(hex, i, j, true));
        }
      });
    });
    cells = next;
  });
  hex.locked = false;
};

export const teardownHex = (hex: Hex) => {
  hex.inited = false;
  hex.locked = true;
  hex.cells.forEach((cell) => {
    unassignTile(hex, cell, false);
  });
  hex.cells = [];
  hex.tiles = [];
  hex.cellMap = {};
};

export const cellAt = (hex: Hex, i: number, j: number, create?: boolean) => {
  const key = i + "-" + j;
  let cell = hex.cellMap[key];
  if (cell || !create) {
    return cell;
  }
  cell = new Cell(i, j);
  hex.cells.push(cell);
  hex.cellMap[key] = cell;
  return cell;
};

export const nearestCell = (hex: Hex, x: number, y: number, max = 1): Cell | null => {
  const xmin = x - max;
  const xmax = x + max;
  const ymin = y - max;
  const ymax = y + max;
  let min = max * max;
  let nearest: Cell | null = null;
  hex.cells.forEach((cell) => {
    if (xmin <= cell.x && cell.x <= xmax && ymin <= cell.y && cell.y <= ymax) {
      const dx = cell.x - x;
      const dy = cell.y - y;
      const d = dx * dx + dy * dy;
      if (d < min) {
        min = d;
        nearest = cell;
      }
    }
  });
  return nearest;
};

export const findPath = (hex: Hex, source: Cell, target: Cell) => {
  const flag = Date.now();
  const queue: Cell[] = [source];
  while (queue.length) {
    const cell = queue.shift();
    cell.flag = flag;
    if (
      connectedCells(hex, cell).some((next) => {
        if (next == target) {
          return true;
        } else if (!next.tile && next.flag != flag) {
          next.flag = flag;
          queue.push(next);
        }
        return false;
      })
    ) {
      return true;
    }
  }
  return false;
};

export const connectedCells = (hex: Hex, target: Cell) => {
  const cells: Cell[] = [];
  Direction.ij.forEach((ij) => {
    const cell = cellAt(hex, target.i + ij.i, target.j + ij.j);
    if (cell) {
      cells.push(cell);
    }
  });
  return cells;
};

export const rowCells = (hex: Hex, target: Cell, dir: number) => {
  const d = Direction.get_ij(dir);
  const cells = [target];
  let cell: Cell;
  for (let s = +1; (cell = cellAt(hex, target.i + s * d.i, target.j + s * d.j)); s++) {
    cells.push(cell);
  }
  for (let s = -1; (cell = cellAt(hex, target.i + s * d.i, target.j + s * d.j)); s--) {
    cells.unshift(cell);
  }
  return cells;
};

export const filledCells = (hex: Hex) => {
  return hex.cells.filter((cell) => cell.tile);
};

export const emptyCells = (hex: Hex) => {
  return hex.cells.filter((cell) => !cell.tile);
};

export const fillSome = (hex: Hex, n: number, queue: boolean) => {
  if (hex.locked) return;

  let adding: string[];
  if (queue && hex.nextTiles && hex.nextTiles.length) {
    adding = hex.nextTiles;
  } else {
    adding = range(n).map(() => Color.random());
  }

  let count = 0;
  const frees = shuffle(emptyCells(hex)).slice(0, adding.length);
  frees.forEach((cell, i) => {
    count++;
    assignTile(hex, cell, new Tile(adding[i]));
  });

  if (queue) {
    hex.nextTiles = range(n).map(() => Color.random());
  } else {
    hex.nextTiles = null;
  }

  return count;
};

export const fillUp = (hex: Hex, color?: string) => {
  if (hex.locked) {
    return;
  }
  hex.cells.forEach((cell) => {
    if (!cell.tile) {
      assignTile(hex, cell, new Tile(color ?? Color.random()));
    }
  });
};

export const rotateRow = (hex: Hex, target: Cell, dir: number, dist: number) => {
  if (hex.locked) return;

  if (!dist) return;

  if (dist < 0) {
    dir = (dir + 3) % 6;
    dist = -dist;
  }
  const cells = rowCells(hex, target, dir);
  for (let d = 0; d < dist; d++) {
    let toCell = cells[0];
    const wrapTile = unassignTile(hex, toCell, false);
    wrapTile.slide = false;
    wrapTile.jump = true;
    for (let c = 1; c < cells.length; c++) {
      const fromCell = cells[c];
      relocateTile(hex, toCell, fromCell, true);
      toCell = fromCell;
    }
    assignTile(hex, toCell, wrapTile);
  }
};

export const collapseHex = (hex: Hex, dir: number) => {
  if (hex.locked) return;

  const d = Direction.get_ij(dir);
  const empties = emptyCells(hex);
  let cont = true;
  while (cont) {
    cont = false;
    for (let e = 0; e < empties.length; e++) {
      const to = empties[e];
      const from = cellAt(hex, to.i + d.i, to.j + d.j);
      if (from && from.tile) {
        relocateTile(hex, to, from, true);
        empties[e] = from;
        cont = true;
      }
    }
  }
};

export const matchAdjacent = (hex: Hex, cell: Cell, matched: Cell[] = [], color?) => {
  if (hex.locked) return;

  if (!cell.isColored()) {
    // empty
  } else if (!color) {
    // first
    color = cell.tile.color;
    matched.push(cell);
    Direction.ij.forEach((ij) => {
      const next = cellAt(hex, cell.i + ij.i, cell.j + ij.j);
      if (!next || matched.includes(next)) return;
      matchAdjacent(hex, next, matched, color);
    });
  } else if (color == cell.tile.color) {
    // match
    matched.push(cell);
    Direction.ij.forEach((ij) => {
      const next = cellAt(hex, cell.i + ij.i, cell.j + ij.j);
      if (!next || matched.includes(next)) return;
      matchAdjacent(hex, next, matched, color);
    });
  } else {
    // not match
  }
  return matched;
};

export const matchRow = (hex: Hex, n: number): number => {
  if (hex.locked) return 0;

  const rows: Cell[][] = [];
  hex.cells.forEach((cell: Cell) => {
    cell.isColored() &&
      Direction.ij.forEach((dij) => {
        const row: Cell[] = [cell];
        for (let d = 1; d < n; d++) {
          const next = cellAt(hex, cell.i + d * dij.i, cell.j + d * dij.j);
          if (!next || !next.tile || next.tile.color != cell.tile?.color) {
            break;
          }
          row.push(next);
        }
        if (row.length >= n) {
          rows.push(row);
        }
      });
  });
  let count = 0;
  rows.forEach((row) => {
    row.forEach((cell) => {
      const tile = unassignTile(hex, cell, true);
      if (tile) count++;
    });
  });
  return count;
};

export const assignTile = (hex: Hex, to: Cell, tile: Tile) => {
  to.tile = tile;
  if (!to.tile) return;
  to.tile.slide = false;
  to.tile.cell = to;
  hex.tiles.push(to.tile);
};

export const relocateTile = (hex: Hex, to: Cell, from: Cell, slide: boolean) => {
  if (!from.tile) return null;
  to.tile = from.tile;
  from.tile = null;
  to.tile.slide = slide;
  to.tile.cell = to;
};

export const unassignTile = (hex: Hex, cell: Cell, collected: boolean) => {
  const tile = cell.tile;
  if (!tile) return null;
  tile.collected = collected;
  tile.cell = null;
  cell.tile = null;
  const index = hex.tiles.indexOf(tile);
  if (index !== -1) hex.tiles.splice(index, 1);
  return tile;
};

export class Color {
  static all = ["y", "b", "r", "g", "p"];

  static x = "x";
  static y = "y";
  static b = "b";
  static r = "r";
  static g = "g";
  static p = "p";

  static random() {
    return Color.all[(Math.random() * Color.all.length) | 0];
  }
}

export class Direction {
  static all = [0, 1, 2, 3, 4, 5];

  static ij: { i: number; j: number }[] = [
    { i: -1, j: 0 },
    { i: 0, j: -1 },
    { i: +1, j: -1 },
    { i: +1, j: 0 },
    { i: 0, j: +1 },
    { i: -1, j: +1 },
  ];

  static get_ij = (dir: number): { i: number; j: number } => {
    dir = dir >= 6 ? dir % 6 : dir < 0 ? (dir % 6) + 6 : dir;
    return Direction.ij[dir];
  };

  static xy: { x: number; y: number }[] = Direction.all.map((dir) => {
    const a = ((dir + 0.5) * Math.PI) / 3;
    return { x: Math.cos(a), y: Math.sin(a) };
  });

  static get_xy = (dir: number): { x: number; y: number } => {
    dir = dir >= 6 ? dir % 6 : dir < 0 ? (dir % 6) + 6 : dir;
    return Direction.xy[dir];
  };

  static fromXY = (dx: number, dy: number): number => {
    let dir = Math.round((Math.atan2(dy, dx) * 3) / Math.PI - 0.5);
    dir = dir >= 6 ? dir % 6 : dir < 0 ? (dir % 6) + 6 : dir;
    return dir;
  };
}

const shuffle = <T>(list: T[]) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
};

const range = (start: number, end?: number) => {
  if (end === undefined) {
    end = start - 1;
    start = 0;
  }
  var foo = [];
  for (var i = start; i <= end; i++) {
    foo.push(i);
  }
  return foo;
};
