import React, {useEffect, useState} from 'react'
import {SettingsKeyEnum, Timer} from './interfaces'
import type {IpcRendererEvent} from 'electron'
const {ipcRenderer} = window.require('electron')

let timeout1: Timer | null = null
let timeout2: Timer | null = null

const secondsToMinutesAndSeconds = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60
	const minutesString = minutes.toString().padStart(2, '0')
	const secondsString = remainingSeconds.toString().padStart(2, '0')
	return `${minutesString}:${secondsString}`
}

const SpeechTimeout = () => {
	const [speechTimeout, setSpeechTimeout] = useState(0)
	const [silence, setSilence] = useState(0)
	const [silanceSensetivity, setSilanceSensetivity] = useState(0)

	const handleSettings = (e: IpcRendererEvent, key: SettingsKeyEnum, value: any) => {
		if (key === SettingsKeyEnum.speechTimeout) setSpeechTimeout(value)
		if (key === SettingsKeyEnum.silanceSensetivity) setSilanceSensetivity(value)
		if (key === SettingsKeyEnum.silenceTime) setSilence(value)
	}

	const handleSetSpeechTimeout = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value)
		setSpeechTimeout(Number(value))
		if (timeout1) clearTimeout(timeout1)
		timeout1 = setTimeout(() => ipcRenderer.invoke('set-settings', SettingsKeyEnum.speechTimeout, value), 500)
	}

	const handleSetSilanceSensetivity = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value)
		setSilanceSensetivity(Number(value))
		if (timeout2) clearTimeout(timeout2)
		timeout2 = setTimeout(() => ipcRenderer.invoke('set-settings', SettingsKeyEnum.silanceSensetivity, value), 500)
	}

	useEffect(() => {
		const main = async () => {
			setSpeechTimeout(await ipcRenderer.invoke('get-settings', SettingsKeyEnum.speechTimeout))
			setSilanceSensetivity(await ipcRenderer.invoke('get-settings', SettingsKeyEnum.silanceSensetivity))
		}
		main()
		ipcRenderer.on('set-settings', handleSettings)
		return () => {
			ipcRenderer.removeListener('set-settings', handleSettings)
		}
	}, [])

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (silence + 1 > speechTimeout) {
				document.body.classList.add('pulls')
			} else {
				document.body.classList.remove('pulls')
			}
			setSilence(silence + 1)
		}, 1000)
		return () => clearTimeout(timeout)
	}, [silence, speechTimeout])

	return (
		<div className='container'>
			<div className='row'>
				<div className='column'>
					<label>Speech timeout</label>
				</div>
				<div className='column'>
					<label className='float-right'>{secondsToMinutesAndSeconds(speechTimeout)}</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<input value={speechTimeout} onChange={handleSetSpeechTimeout} type='range' min='0' max='300' />
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<label>Silence sensetivity</label>
				</div>
				<div className='column'>
					<label className='float-right'>{secondsToMinutesAndSeconds(silanceSensetivity)}</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<input
						value={silanceSensetivity}
						onChange={handleSetSilanceSensetivity}
						type='range'
						min='0'
						max='10'
					/>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<label>Silence</label>
				</div>
				<div className='column'>
					<label className='float-right'>{secondsToMinutesAndSeconds(silence)}</label>
				</div>
			</div>
			<div className='row'>
				<div className='column'>
					<meter
						className={speechTimeout > silence ? 'disabled' : 'active'}
						min='0'
						max='300'
						value={silence}
					/>
				</div>
			</div>
		</div>
	)
}

export default SpeechTimeout
