// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Dataset, Driver, Memo, Middleware } from "polymatic";

import { type MainContext } from "./Main";
import { type Tile, type Cell } from "./Hex";
import { Format } from "./Format";

const CELL_SIZE = 29;

export class PlayScreen extends Middleware<MainContext> {
  container: Stage.Node;

  resetButton: Stage.Anim;
  homeButton: Stage.Sprite;
  nextTiles: Stage.Monotype;
  scoreTotal: Stage.Monotype;
  scoreAdded: Stage.Monotype;
  timer: Stage.Monotype;
  lastScore: Stage.Monotype;
  topScore: Stage.Monotype;

  hexBoard: Stage.Node;
  hexTiles: Stage.Node;
  hexCells: Stage.Node;

  constructor() {
    super();

    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);

    this.on("frame-render", this.handleFrameRender);
  }

  handleActivate = () => {
    this.createComponents();

    this.container.appendTo(this.context.layout);
  };

  handleDeactivate = () => {
    this.container.remove();
  };

  createComponents() {
    if (this.container) return false;
    this.container = Stage.maximize();

    this.resetButton = Stage.anim("reset", 1);
    this.resetButton.appendTo(this.container);
    this.resetButton.pin({
      alignX: 1,
      alignY: 1,
      offsetX: -5,
      offsetY: -5,
    });
    this.resetButton.on(Stage.POINTER_CLICK, () => this.emit("user-reset-play"));

    this.homeButton = Stage.sprite("burger");
    this.homeButton.appendTo(this.container);
    this.homeButton.pin({
      alignX: 0,
      alignY: 1,
      offsetX: 5,
      offsetY: -5,
    });
    this.homeButton.on(Stage.POINTER_CLICK, () => this.emit("set-screen", { name: "home" }));

    this.nextTiles = Stage.monotype("tile");
    this.nextTiles.appendTo(this.container);
    this.nextTiles.pin({
      alignX: 1,
      alignY: 0,
      offsetX: -9,
      offsetY: 10,
      scale: 0.4,
    });

    this.scoreTotal = Stage.monotype("digit");
    this.scoreTotal.appendTo(this.container);
    this.scoreTotal.pin({
      alignX: 0,
      alignY: 0,
      offsetX: 9,
      offsetY: 8,
      scale: 1.1,
    });

    this.scoreAdded = Stage.monotype("digit");
    this.scoreAdded.appendTo(this.container);
    this.scoreAdded.pin({
      alignX: 0.5,
      alignY: 0,
      offsetX: 0,
      offsetY: 8,
      scale: 0.9,
    });

    this.timer = Stage.monotype("digit");
    this.timer.appendTo(this.container);
    this.timer.pin({
      alignX: 1,
      alignY: 0,
      handleX: 0,
      offsetX: -50,
      offsetY: 8,
      scale: 1.1,
    });

    this.lastScore = Stage.monotype("digit");
    this.lastScore.appendTo(this.container);
    this.lastScore.pin({
      align: 0.5,
      scale: 1.4,
    });

    this.topScore = Stage.monotype("digit");
    this.topScore.appendTo(this.container);
    this.topScore.pin({
      alignX: 0.5,
      alignY: 1,
      offsetX: 0,
      offsetY: -14,
      scale: 0.8,
    });

    this.hexBoard = Stage.component();
    this.hexBoard.attr("spy", true);
    this.hexBoard.prependTo(this.container);
    this.hexBoard.pin({
      align: 0.5,
      handle: 0,
    });

    this.hexCells = Stage.component();
    this.hexCells.appendTo(this.hexBoard);

    this.hexTiles = Stage.component();
    this.hexTiles.appendTo(this.hexBoard);

    this.hexBoard.on(Stage.POINTER_DOWN, (point) => {
      this.emit("user-pointer-down", { x: point.x / CELL_SIZE, y: point.y / CELL_SIZE });
      return true;
    });

    this.hexBoard.on(Stage.POINTER_MOVE, (point) => {
      this.emit("user-pointer-move", { x: point.x / CELL_SIZE, y: point.y / CELL_SIZE });
      return true;
    });

    this.hexBoard.on(Stage.POINTER_UP, (point) => {
      this.emit("user-pointer-up", { x: point.x / CELL_SIZE, y: point.y / CELL_SIZE });
      return true;
    });

    this.hexBoard.on(Stage.POINTER_CANCEL, (point) => {
      this.emit("user-pointer-cancel");
      return true;
    });

    this.hexBoard.on(Stage.POINTER_CLICK, (point) => {
      this.emit("click", { x: point.x / CELL_SIZE, y: point.y / CELL_SIZE });
      return true;
    });

    return true;
  }

  gameStateMemo = Memo.init();

  handleFrameRender = () => {
    const status = this.context.status;
    if (this.gameStateMemo.update(status.state)) {
      if (status.state === "playing") {
        this.resetButton.stop(0);
        this.lastScore.hide();
      } else if (status.state === "gameover") {
        this.resetButton.play();
        this.lastScore.show();
        const isTopScore = status.currentScore > 0 && (!status.topScore || status.currentScore > status.topScore);
        this.lastScore.value(status.currentScore + (isTopScore ? "S" : ""));
      }

      if (status?.topScore) {
        this.topScore.value(status.topScore + "s");
        this.topScore.show();
      } else {
        this.topScore.hide();
      }
    }

    this.scoreTotal.value(status.currentScore);

    if (status.newScore) {
      const value = (status.newScore > 0 ? "+" : "") + status.newScore;
      this.scoreAdded.value(value);
      this.scoreAdded.show();
    } else {
      this.scoreAdded.hide();
    }

    if (typeof status.timer === "number" && status.timer >= 0) {
      this.timer.value(Format.time(status.timer));
      this.timer.show();
    } else {
      this.timer.hide();
    }

    const hex = this.context.hex;
    if (hex.nextTiles?.length) {
      this.nextTiles.value(hex.nextTiles.join(""));
      this.nextTiles.show();
    } else {
      this.nextTiles.hide();
    }
    this.hexBoard.show();

    if (status.state === "playing") {
      this.binder.data([...hex.tiles, ...hex.cells]);
    } else {
      this.binder.data([]);
    }
  };

  renderCell = Driver.create<Cell, CellComponent>({
    filter: (cell: Cell) => {
      return cell.type == "cell";
    },
    enter: (cell: Cell) => {
      const component = new CellComponent();
      component.appendTo(this.hexCells);
      component.enter(cell);
      return component;
    },
    update: (cell: Cell, component: CellComponent) => {
      component.update(cell);
    },
    exit: (cell: Cell, component: CellComponent) => {
      component.exit(cell);
    },
  });

  renderTile = Driver.create<Tile, TileComponent>({
    filter: (obj: Tile) => {
      return obj.type == "tile";
    },
    enter: (tile: Tile) => {
      const component = new TileComponent();
      component.appendTo(this.hexTiles);
      component.enter(tile);
      return component;
    },
    update: (tile: Tile, component: TileComponent) => {
      component.update(tile);
    },
    exit: (tile: Tile, component: TileComponent) => {
      component.exit(tile);
    },
  });

  binder = Dataset.create<Cell | Tile>({
    key: (obj) => obj.key,
    drivers: [this.renderCell, this.renderTile],
  });
}

class CellComponent extends Stage.Sprite {
  constructor() {
    super();
    this.texture("cell");
  }

  enter(cell: Cell) {}

  update(cell: Cell) {
    const offsetX = (cell.x - 0.5) * CELL_SIZE;
    const offsetY = (cell.y - 0.5) * CELL_SIZE;

    this.offset(offsetX, offsetY);
    this.visible(!cell.hidden);
  }

  exit(cell: Cell) {
    this.remove();
  }
}

class TileComponent extends Stage.Monotype {
  transformMemo = Memo.init();
  colorMemo = Memo.init();
  selectedMemo = Memo.init();

  animation: Stage.Sprite | Stage.Transition;

  constructor() {
    super();
    this.frames("tile");
    this.value("x");
  }

  enter(tile: Tile) {
    this.value(tile.color);
    this.pin("pivot", 0.5);
    this.scale(0.01).alpha(0.01).tween(100).scale(1).alpha(1);
  }

  update(tile: Tile) {
    if (this.transformMemo.update(tile.cell.x, tile.cell.y)) {
      const x = (tile.cell.x - 0.5) * CELL_SIZE;
      const y = (tile.cell.y - 0.5) * CELL_SIZE;

      if (tile.slide) {
        this.tween(100).scale(1).offset(x, y);
      } else if (tile.jump) {
        this.tween(100).scale(0).tween(100).scale(1).offset(x, y);
      } else {
        this.scale(1).offset(x, y);
      }
    }

    if (this.colorMemo.update(tile.color)) {
      this.value(tile.color);
    }

    if (this.selectedMemo.update(tile.selected)) {
      this.scale(tile.selected ? 1.15 : 1).alpha(0.9);
    }
  }

  exit(tile: Tile) {
    if (tile.collected) {
      this.tween(100).alpha(0.01).scale(0.01).remove();
    } else {
      this.remove();
    }
  }
}
