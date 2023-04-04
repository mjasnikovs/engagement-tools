import {useState, useEffect} from 'react'
import {AudioInputDeviceInterface, SettingsKeyEnum} from './interfaces'
const {ipcRenderer} = window.require('electron')

const AudioRecorder = () => {
	const [audioData, setAudioData] = useState<Blob | null>(null)
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
	const [audioDevice, setAudioDevice] = useState<AudioInputDeviceInterface | null>(null)

	const handleSettings = (_: void, key: SettingsKeyEnum, value: AudioInputDeviceInterface) => {
		if (key === SettingsKeyEnum.defaultAudioDevice) setAudioDevice(value)
	}

	useEffect(() => {
		ipcRenderer.on('set-settings', handleSettings)
		return () => ipcRenderer.removeListener('set-settings', handleSettings)
	}, [])

	const startRecording = () => {
		if (!audioDevice) return
		navigator.mediaDevices
			.getUserMedia({audio: {deviceId: audioDevice.deviceId}, video: false})
			.then(stream => {
				const mediaRecorder = new MediaRecorder(stream)
				const chunks: Blob[] = []

				mediaRecorder.addEventListener('dataavailable', event => {
					chunks.push(event.data)
				})

				mediaRecorder.addEventListener('stop', () => {
					const blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'})
					setAudioData(blob)
				})

				mediaRecorder.start()
				setMediaRecorder(mediaRecorder)
			})
			.catch(err => console.error(err))
	}

	const stopRecording = () => {
		if (mediaRecorder) {
			mediaRecorder.stop()
		}
	}

	return (
		audioDevice && (
			<div>
				<button onClick={startRecording}>Start Recording</button>
				<button onClick={stopRecording}>Stop Recording</button>
				{audioData && <audio controls src={URL.createObjectURL(audioData)} />}
			</div>
		)
	)
}

export default AudioRecorder
