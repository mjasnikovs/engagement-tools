import React, {useEffect, useState} from 'react'
import {AudioInputDeviceInterface, SettingsKeyEnum, Timer} from './interfaces'
import type {IpcRendererEvent} from 'electron'
const {ipcRenderer} = window.require('electron')

let timeout: Timer | null = null
let talkingCoeff: number = 0

const AudioDeviceAnalyser = () => {
	const [audioPeak, setAudioPeak] = useState(0)
	const [audioThreshold, setAudioThreshold] = useState(0)
	const [audioDevice, setAudioDevice] = useState<AudioInputDeviceInterface | null>(null)

	const handleSettings = (e: IpcRendererEvent, key: SettingsKeyEnum, value: any) => {
		if (key === SettingsKeyEnum.defaultAudioDevice) setAudioDevice(value)
		if (key === SettingsKeyEnum.audioThreshold) setAudioThreshold(value)
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
		}
		main()

		const silenceInterval = setInterval(() => {
			if (talkingCoeff > 300) {
				talkingCoeff = 0
				ipcRenderer.invoke('set-settings', SettingsKeyEnum.silenceTime, 0)
			}
		}, 1000)

		ipcRenderer.on('set-settings', handleSettings)
		return () => {
			clearInterval(silenceInterval)
			ipcRenderer.removeListener('set-settings', handleSettings)
		}
	}, [])

	useEffect(() => {
		audioThreshold > audioPeak ? --talkingCoeff : ++talkingCoeff
		if (talkingCoeff < 0) talkingCoeff = 0
	}, [audioThreshold, audioPeak])

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
						className={audioPeak < audioThreshold ? 'disabled' : 'active'}
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
