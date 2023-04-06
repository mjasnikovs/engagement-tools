# Welcome to the Engagement-Tools App!

This app is designed to help livestreamers engage better with their audience by detecting periods of silence and warning the user to speak up!

To use this app, simply start your livestream and launch the Engagement-Tools app. The app will run in the background and monitor your audio input. If the app detects a period of silence for an extended period of time, it will issue a warning to the user.

Thank you for using the Engagement-Tools app, and happy livestreaming!

![alt engagement-tools](screenshot.png)

## Settings
Threshold: This setting refers to the minimum volume level that the app will recognize as speech. You can adjust this setting to make the app more or less sensitive to speech.

Peak: This setting allows the user to monitor the maximum volume level of their audio input.

Speech timeout: This setting determines the maximum duration of silence before the app issues a warning to the user. The user can adjust this value to set the maximum time allowed for silence before the app prompts the user to speak up.

Silence sensitivity: This setting determines how sensitive the app is to periods of silence. The user can adjust this value to make the app more or less sensitive to silence. The larger the value, the longer you have to talk to reset the silence.

Silence monitor: This setting allows the user to monitor the duration and frequency of periods of silence during their livestream.

####  Build for Win using docker
```js
docker pull electronuserland/builder:wine

docker run --rm -ti \
-v /path/to/your/app:/project \
electronuserland/builder:wine

npm run electron:buildwin
```
