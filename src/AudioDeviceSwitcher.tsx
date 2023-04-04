import React, {useEffect, useState} from 'react'
import {AudioInputDeviceInterface, SettingsKeyEnum} from './interfaces'
import type {IpcRendererEvent} from 'electron'
const {ipcRenderer} = window.require('electron')

const AudioDeviceSwitcher = () => {
	const [audioDeviceList, setAudioDeviceList] = useState<AudioInputDeviceInterface[]>([])
	const [audioDevice, setAudioDevice] = useState<AudioInputDeviceInterface | null>(null)

	const [error, setError] = useState<string | null>(null)

	const setDefaultAudioDevice = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const find = audioDeviceList.find(d => d.deviceId === e.target.value)
		if (typeof find !== 'undefined') ipcRenderer.invoke('set-settings', SettingsKeyEnum.defaultAudioDevice, find)
	}

	const handleSettings = (e: IpcRendererEvent, key: SettingsKeyEnum, value: AudioInputDeviceInterface) => {
		if (key === SettingsKeyEnum.defaultAudioDevice) setAudioDevice(value)
	}

	useEffect(() => {
		ipcRenderer.on('set-settings', handleSettings)
		return () => {
			ipcRenderer.removeListener('set-settings', handleSettings)
		}
	}, [])

	useEffect(() => {
		const main = async () => {
			const devices = await navigator.mediaDevices.enumerateDevices()
			const audioDevices = devices
				.map(device => {
					return {kind: device.kind, label: device.label, deviceId: device.deviceId}
				})
				.filter(device => device.kind === 'audioinput')

			setAudioDeviceList(audioDevices)

			const defaultAudioDevice = await ipcRenderer.invoke('get-settings', SettingsKeyEnum.defaultAudioDevice)
			const find = defaultAudioDevice && audioDevices.find(d => d.deviceId === defaultAudioDevice.deviceId)

			if (typeof defaultAudioDevice === 'undefined' || typeof find === 'undefined') {
				return await ipcRenderer.invoke('set-settings', SettingsKeyEnum.defaultAudioDevice, audioDevices[0])
			}
			return await ipcRenderer.invoke('set-settings', SettingsKeyEnum.defaultAudioDevice, find)
		}

		main().catch(err => {
			console.error(err)
			setError(err.message)
		})
	}, [])

	return (
		<div className='container'>
			<div className='row'>
				<div className='column'>
					<label>Audio Device</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<select onChange={setDefaultAudioDevice} value={audioDevice ? audioDevice.deviceId : undefined}>
						{audioDeviceList.map(device => {
							return (
								<option key={device.deviceId} value={device.deviceId}>
									{device.label}
								</option>
							)
						})}
					</select>
				</div>
			</div>
			{error && (
				<blockquote>
					<h5>Error</h5>
					<p>{error}</p>
					<input onClick={() => setError(null)} className='button button-clear' type='button' value='Clear' />
				</blockquote>
			)}
		</div>
	)
}

export default AudioDeviceSwitcher
