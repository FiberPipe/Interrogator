import {Listener} from "../types/global";

const { ipcRenderer, contextBridge } = require('electron')

const electron = {
	send: (channel: string, text: string) => {
		ipcRenderer.send(channel, text)
	},
	// todo: unsubscribe method
	subscribe: (channel: string, listener: Listener) => {
		ipcRenderer.on(channel, (_, value) => {
			listener(value)
		})
	},
}

contextBridge.exposeInMainWorld('electron', electron)
