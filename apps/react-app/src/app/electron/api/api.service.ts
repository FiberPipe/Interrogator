import {BrowserWindow} from "electron";
import {FileWatcherService} from "../file-watcher";

export class ApiService {
 #fileWatcher: FileWatcherService;

 constructor(window: BrowserWindow) {
	this.#fileWatcher = new FileWatcherService('message', window)
 }

 start(){
  this.#fileWatcher.watch('test.txt')
 }
}
