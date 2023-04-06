import React, {useEffect, useState} from 'react'
import {AudioInputDeviceInterface, SettingsKeyEnum, Timer} from './interfaces'
import type {IpcRendererEvent} from 'electron'
const {ipcRenderer} = window.require('electron')

let timeout: Timer | null = null
let speechTime: number = 0

const AudioDeviceAnalyser = () => {
	const [audioPeak, setAudioPeak] = useState(0)
	const [audioThreshold, setAudioThreshold] = useState(0)
	const [audioDevice, setAudioDevice] = useState<AudioInputDeviceInterface | null>(null)
	const [silanceSensetivity, setSilanceSensetivity] = useState(0)

	const handleSettings = (e: IpcRendererEvent, key: SettingsKeyEnum, value: any) => {
		if (key === SettingsKeyEnum.defaultAudioDevice) setAudioDevice(value)
		if (key === SettingsKeyEnum.audioThreshold) setAudioThreshold(value)
		if (key === SettingsKeyEnum.silanceSensetivity) setSilanceSensetivity(value)
	}

	const handleSetAudioThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value)
		setAudioThreshold(Number(value))
		if (timeout) clearTimeout(timeout)
		timeout = setTimeout(() => ipcRenderer.invoke('set-settings', SettingsKeyEnum.audioThreshold, value), 500)
	}

	useEffect(() => {
		const main = async () => {
			setAudioDevice(await ipcRenderer.invoke('get-settings', SettingsKeyEnum.defaultAudioDevice))
			setAudioThreshold(await ipcRenderer.invoke('get-settings', SettingsKeyEnum.audioThreshold))
			setSilanceSensetivity(await ipcRenderer.invoke('get-settings', SettingsKeyEnum.silanceSensetivity))
		}
		main()

		ipcRenderer.on('set-settings', handleSettings)
		return () => {
			ipcRenderer.removeListener('set-settings', handleSettings)
		}
	}, [])

	useEffect(() => {
		if (audioPeak >= audioThreshold) {
			speechTime += 50
		} else {
			speechTime -= 50
		}
		if (speechTime < 0) speechTime = 0

		if (speechTime > silanceSensetivity * 1000) {
			speechTime = 0
			ipcRenderer.invoke('set-settings', SettingsKeyEnum.silenceTime, 0)
		}
	}, [audioPeak, audioThreshold, silanceSensetivity])

	useEffect(() => {
		let source: MediaStreamAudioSourceNode | null = null
		let audioContext: AudioContext | null = null
		let audioStream: MediaStream | null = null
		let interval: Timer | null = null

		const main = async () => {
			if (audioDevice !== null) {
				audioStream = await navigator.mediaDevices.getUserMedia({
					audio: {
						deviceId: audioDevice.deviceId
					},
					video: false
				})

				audioContext = new AudioContext()
				const analyser = audioContext.createAnalyser()

				source = audioContext.createMediaStreamSource(audioStream)
				source.connect(analyser)

				interval = setInterval(() => {
					const dataArray = new Uint8Array(analyser.frequencyBinCount)
					analyser.getByteFrequencyData(dataArray)
					const max = Math.max(...dataArray)
					setAudioPeak((max / 255) * 100)
				}, 50)
			}
		}

		main()

		return () => {
			if (source) source.disconnect()
			if (interval) clearInterval(interval)
			if (audioContext) audioContext.close()
			if (audioStream) audioStream.getTracks().forEach(track => track.stop())
		}
	}, [audioDevice])

	return (
		<div className='container'>
			<div className='row'>
				<div className='column'>
					<label>Threshold</label>
				</div>
				<div className='column'>
					<label className='float-right'>{audioThreshold.toFixed(0).padStart(2, '0')}</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<input value={audioThreshold} onChange={handleSetAudioThreshold} type='range' min='0' max='100' />
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<label>Peak</label>
				</div>
				<div className='column'>
					<label className='float-right'>{audioPeak.toFixed(0).padStart(2, '0')}</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<meter
						className={audioPeak > audioThreshold ? 'active' : 'disabled'}
						min='0'
						max='100'
						value={audioPeak.toFixed(2)}
					/>
				</div>
			</div>
		</div>
	)
}

export default AudioDeviceAnalyser
