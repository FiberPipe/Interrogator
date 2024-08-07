import { BrowserWindow, app } from 'electron'

async function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		titleBarStyle: 'hidden',
	})

	const env = process.env.NODE_ENV || 'development'

	if (env === 'production') {
		await mainWindow.loadFile('build/index.html')
	} else {
		await mainWindow.loadURL('http://localhost:3000/')
	}
}

app.whenReady().then(() => {
 createWindow()

 app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
	 createWindow()
	}
 })
})

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
	app.quit()
 }
})
