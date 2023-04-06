export interface AudioInputDeviceInterface {
	kind: MediaDeviceKind
	label: string
	deviceId: string
}

export enum SettingsKeyEnum {
	defaultAudioDevice = 'defaultAudioDevice',
	audioThreshold = 'audioThreshold',
	speechTimeout = 'speechTimeout',
	silenceTime = 'silenceTime',
	silanceSensetivity = 'silanceSensetivity'
}

export interface SettingsInterface {
	[SettingsKeyEnum.defaultAudioDevice]: AudioInputDeviceInterface | null
	[SettingsKeyEnum.audioThreshold]: number
	[SettingsKeyEnum.speechTimeout]: number
	[SettingsKeyEnum.silenceTime]: number
	[SettingsKeyEnum.silanceSensetivity]: number
}

export type Timer = ReturnType<typeof setTimeout | typeof setInterval>
