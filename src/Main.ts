// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import { BoardFlip } from "./BoardFlip";
import { BoardSlide } from "./BoardSlide";
import { BoardJump } from "./BoardJump";
import { PlayScreen } from "./PlayScreen";
import { HomeScreen } from "./HomeScreen";
import { Loader } from "./Loader";
import { Resize } from "./Resize";

import { type Status } from "./BoardStatus";
import { type Hex } from "./Hex";
import { ScreenSwitch } from "./ScreenSwitch";
import { FrameLoop } from "./FrameLoop";
import { Save } from "./Save";

export interface MainContext {
  stage?: Stage.Root;
  layout?: Stage.Node;

  hex: Hex;
  status: Status;

  screen: {
    name: string;
    mode?: number;
  };
}

export class Main extends Middleware<MainContext> {
  constructor() {
    super();

    this.on("stage-loaded", this.handleLoaded);

    this.use(new FrameLoop());
    this.use(new Loader());
    this.use(new Resize());
    this.use(new Save());
    this.use(
      new ScreenSwitch({
        "play-1": new FlipScreen(),
        "play-2": new SlideScreen(),
        "play-3": new JumpScreen(),
        "home": new HomeScreen(),
      })
    );
  }

  handleLoaded() {
    this.emit("set-screen", { name: "home" });
  }
}

export class FlipScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardFlip());
    this.use(new PlayScreen());
  }
}

export class SlideScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardSlide());
    this.use(new PlayScreen());
  }
}

export class JumpScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardJump());
    this.use(new PlayScreen());
  }
}
