# Welcome to the Engagement-Tools App!

This app is designed to help livestreamers engage better with their audience by detecting periods of silence and warning the user to speak up!

To use this app, simply start your livestream and launch the Engagement-Tools app. The app will run in the background and monitor your audio input. If the app detects a period of silence for an extended period of time, it will issue a warning to the user.

Thank you for using the Engagement-Tools app, and happy livestreaming!

### Build for Win using docker

```js
docker pull electronuserland/builder:wine

docker run --rm -ti \
-v /path/to/your/app:/project \
electronuserland/builder:wine

npm run electron:buildwin
```
