// Copyright (c) Ali Shakiba
// Licensed under the MIT License

/** Which screen is up, and for a play screen which mode it is playing. */
export interface ScreenConfig {
  name: string;
  mode?: number;
  [key: string]: any;
}

export interface PlayModeInfo {
  mode: number;
  /** what the mode is called, and how many in a row it takes */
  name: string;
  /** how it is played, in a line - the menu card is built from this */
  about: string;
}

/** modes: 1 flip, 2 slide, 3 jump */
export const PlayModes: PlayModeInfo[] = [
  {
    mode: 1,
    name: "Tap 2+",
    about: "Tap two or more matching circles.",
  },
  {
    mode: 2,
    name: "Slide 3+",
    about: "Slide a row along any of the three directions to line up three of a color.",
  },
  {
    mode: 3,
    name: "Jump 4+",
    about: "Move one circle at a time to make a row of four of a color.",
  },
];
