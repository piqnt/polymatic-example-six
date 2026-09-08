// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext } from "../model";
import { BoardFlip } from "./BoardFlip";
import { BoardSlide } from "./BoardSlide";
import { BoardJump } from "./BoardJump";
import { Loader } from "./Loader";
import { Resize } from "./Resize";
import { ScreenSwitch } from "./ScreenSwitch";
import { FrameLoop } from "./FrameLoop";
import { Save } from "./Save";
import { BoardView } from "./BoardView";
import { HudManager } from "./HudManager";

/**
 * The runtime. It owns the hex board on the Stage.js canvas; the home menu and
 * the play hud are the shell's (see shell/App), and the two meet at the signals
 * on MainContext.
 */
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
        // the home menu is a Preact page with nothing running behind it
        "home": new Middleware(),
      }),
    );
  }

  handleLoaded = () => {
    this.context.ready.value = true;
    this.emit("set-screen", { name: "home" });
  };
}

export class FlipScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardFlip());
    this.use(new BoardView());
    this.use(new HudManager());
  }
}

export class SlideScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardSlide());
    this.use(new BoardView());
    this.use(new HudManager());
  }
}

export class JumpScreen extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new BoardJump());
    this.use(new BoardView());
    this.use(new HudManager());
  }
}
