// Copyright (c) Ali Shakiba
// Licensed under the MIT License

export class Format {
  static time(ms: number) {
    const s = Math.floor(ms / 1000);
    const seconds = s % 60;
    const minutes = (s / 60) | 0;
    return minutes + ":" + ("0" + seconds).slice(-2);
  }
}
