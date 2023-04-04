export interface AudioInputDeviceInterface {
	kind: MediaDeviceKind
	label: string
	deviceId: string
}

export enum SettingsKeyEnum {
	defaultAudioDevice = 'defaultAudioDevice',
	audioThreshold = 'audioThreshold',
	speechTimeout = 'speechTimeout',
	silenceTime = 'silenceTime'
}

export interface SettingsInterface {
	[SettingsKeyEnum.defaultAudioDevice]: AudioInputDeviceInterface
	[SettingsKeyEnum.audioThreshold]: number
	[SettingsKeyEnum.speechTimeout]: number
	[SettingsKeyEnum.silenceTime]: number
}

export type Timer = ReturnType<typeof setTimeout | typeof setInterval>
