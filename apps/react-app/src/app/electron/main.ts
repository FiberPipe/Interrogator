import { BrowserWindow, app } from 'electron'
import { join } from 'node:path'
import {ApiService} from "./api";

async function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1080,
		height: 720,
		titleBarStyle: 'hidden',
		webPreferences: {
			preload: join(app.getAppPath(), 'build/src/app/electron/bridge.js'),
		},
	})

	const env = process.env.NODE_ENV || 'development'

	if (env === 'production') {
		await mainWindow.loadFile('build/index.html')
	} else {
		await mainWindow.loadURL('http://localhost:3000/')
	}

	return mainWindow;
}

app.whenReady().then(async () => {
	let window = await createWindow()

	app.on('activate', async () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			window = await createWindow()
		}
	})

	const apiService = new ApiService(window)

	apiService.start();
})

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
	app.quit()
 }
})
