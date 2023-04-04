export interface AudioInputDeviceInterface {
	kind: MediaDeviceKind
	label: string
	deviceId: string
}

export enum SettingsKeyEnum {
	defaultAudioDevice = 'defaultAudioDevice',
	audioThreshold = 'audioThreshold',
	talkingTimeout = 'talkingTimeout'
}

export interface SettingsInterface {
	[SettingsKeyEnum.defaultAudioDevice]: AudioInputDeviceInterface
	[SettingsKeyEnum.audioThreshold]: number
	[SettingsKeyEnum.talkingTimeout]: number
}

export type Timer = ReturnType<typeof setTimeout | typeof setInterval>
