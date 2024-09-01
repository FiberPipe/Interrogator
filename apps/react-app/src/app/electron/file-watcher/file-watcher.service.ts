import * as fs from "node:fs";
import {BrowserWindow } from 'electron'

export class FileWatcherService {
 #channel: string;
 #window: BrowserWindow;

 constructor(
	channel: string,
	window: BrowserWindow,
 ) {
	this.#channel = channel;
	this.#window = window;
 }

 watch(filePath: string): void {
		fs.watchFile(filePath, { interval: 1000, persistent: true }, ()=>{
		 this.#watch(filePath)
		});
 }

 #watch(filePath: string): void {
	const content = fs.readFileSync(filePath, { encoding: 'utf-8' });

	this.#send(content);
 }

//    // Читаем последние 200 строк из файла
//    async #watch(filePath: string): Promise<void> {
//     try {
//       const lines = await readLastLines.read(filePath, 200);
//       this.#send(lines);
//     } catch (error) {
//       console.error(Error reading file: ${error});
//     }
//   }


 #send(text: string): void {
	this.#window.webContents.send(this.#channel, text);
 }
}
