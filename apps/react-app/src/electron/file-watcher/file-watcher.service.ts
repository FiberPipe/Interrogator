import * as fs from "node:fs";
import { BrowserWindow } from "electron";

export class FileWatcherService {
  #channel: string;
  #window: BrowserWindow;

  constructor(channel: string, window: BrowserWindow) {
    this.#channel = channel;
    this.#window = window;
  }

  watch(filePath: string): void {
    fs.watchFile(filePath, { interval: 1000, persistent: true }, () => {
      this.#watch(filePath);
    });
  }

  #watch(filePath: string): void {
    const content = fs.readFileSync(filePath, { encoding: "utf-8" });

    this.#send(content as any);
  }

  #send(text: string): void {
    console.log(text);
    this.#window.webContents.send(this.#channel, text);
  }
}
