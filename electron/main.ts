import {app, BrowserWindow, ipcMain, ipcRenderer} from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'
import {SettingsInterface, SettingsKeyEnum} from '../src/interfaces'

let userSettings: SettingsInterface = {
	defaultAudioDevice: {
		kind: 'audioinput',
		label: 'Default',
		deviceId: 'default'
	},
	audioThreshold: 20,
	talkingTimeout: 30000
}

const CONFIG_JSON = path.resolve(app.getPath('userData'), './engagement-tools.json')

const createWindow = async () => {
	try {
		await fs.access(CONFIG_JSON, fs.constants.R_OK | fs.constants.W_OK)
	} catch (e) {
		await fs.writeFile(CONFIG_JSON, '{}')
	}

	userSettings = JSON.parse(await fs.readFile(CONFIG_JSON, 'utf-8'))

	const win = new BrowserWindow({
		width: 1000,
		height: 400,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false
		}
	})

	if (app.isPackaged) {
		win.loadURL(`file://${__dirname}/../index.html`)
	} else {
		win.loadURL('http://localhost:3000/index.html')
		win.webContents.openDevTools()

		// Hot Reloading on 'node_modules/.bin/electronPath'
		require('electron-reload')(__dirname, {
			electron: path.join(
				__dirname,
				'..',
				'..',
				'node_modules',
				'.bin',
				'electron' + (process.platform === 'win32' ? '.cmd' : '')
			),
			forceHardReset: true,
			hardResetMethod: 'exit'
		})
	}
}

app.whenReady().then(() => {
	installExtension(REACT_DEVELOPER_TOOLS)
		.then(name => console.log(`Added Extension:  ${name}`))
		.catch(err => console.log('An error occurred: ', err))

	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') app.quit()
	})

	ipcMain.handle('get-settings', (_, key: SettingsKeyEnum): any => userSettings[key])

	ipcMain.handle('set-settings', async (event, key: SettingsKeyEnum, value) => {
		userSettings[key] = value
		fs.writeFile(CONFIG_JSON, JSON.stringify(userSettings, null, 4))
		event.sender.send('set-settings', key, value)
		return value
	})
})
