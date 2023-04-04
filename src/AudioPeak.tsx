import React, {useRef, useEffect, useState} from 'react'

const AudioLevelPeak: React.FC = () => {
	const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (!audioStream) {
			return
		}

		const audioContext = new AudioContext()
		const analyser = audioContext.createAnalyser()
		const source = audioContext.createMediaStreamSource(audioStream)

		source.connect(analyser)

		const canvas = canvasRef.current
		const canvasCtx = canvas?.getContext('2d')

		if (!canvas || !canvasCtx) {
			return
		}

		const draw = () => {
			const dataArray = new Uint8Array(analyser.frequencyBinCount)
			analyser.getByteFrequencyData(dataArray)
			const max = Math.max(...dataArray)

			canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
			canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.5)'
			canvasCtx.fillRect(0, 0, (max / 255) * canvas.width, canvas.height)

			requestAnimationFrame(draw)
		}

		draw()

		return () => {
			audioStream.getTracks().forEach(track => track.stop())
		}
	}, [audioStream])

	const handleStartRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({audio: true})
		console.log('analyzer', stream.getAudioTracks()[0].label)
		setAudioStream(stream)
	}

	const handleStopRecording = () => {
		setAudioStream(null)
	}

	return (
		<div>
			<button onClick={handleStartRecording}>Start Recording</button>
			<button onClick={handleStopRecording}>Stop Recording</button>
			{audioStream && <canvas ref={canvasRef} width={300} height={50} />}
		</div>
	)
}

export default AudioLevelPeak
