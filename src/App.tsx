import AudioDeviceSwitcher from './AudioDeviceSwitcher'
import AudioDeviceAnalyser from './AudioDeviceAnalyser'
import SpeechTimeout from './SpeechTimeout'
import HyperLinks from './HyperLinks'

const App = () => {
	return (
		<>
			<AudioDeviceSwitcher />
			<AudioDeviceAnalyser />
			<SpeechTimeout />
			<HyperLinks />
		</>
	)
}

export default App
