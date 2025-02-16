# SkyPortal Mobile

This is the mobile version of the [SkyPortal](https://github.com/skyportal/skyportal) platform. It is built with Ionic
React and is available for both iOS and Android.

## Development requirements and setup

### Node.js and npm

To run the app locally, you will need to have Node.js and npm installed. You can install them
using [nvm](https://github.com/nvm-sh/nvm) or just install a recent version from
the [node website](https://nodejs.org/).

### Android Studio

To be able to build the Android version, you will need to have Android Studio installed with the Android SDK. You can
follow the instructions [here](https://developer.android.com/studio/install) to
install Android Studio. Then, open Android Studio, go to **Tools -> SDK Manager** and install the latest stable Android
SDK as shown below ![img.png](doc/android_studio_sdk_install.png)
You will also have to set the `ANDROID_HOME` environment variable to the path of the Android SDK. You can do that by
setting the ANDROID_HOME variable to your installation path for the Android SDK. You can do it by adding the following
line to your `.bashrc` or `.zshrc` file:

```bash
export ANDROID_HOME=<your-installation-path>/Android/Sdk
```

Usually, the default installation path is `/Users/<your-username>/Library/Android/Sdk` on macOS and
`C:\Users\<your-username>\AppData\Local\Android\sdk` on Windows.

Additionally, you might have to add the `platform-tools` directory to your `PATH` environment variable. You can do that
by adding the following line to your `.bashrc` or `.zshrc` file:

```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Xcode (macOS only)

To build the iOS version, you will need a macOS computer with Xcode installed. You can install Xcode from
the [App Store](https://apps.apple.com/fr/app/xcode/id497799835).

### Ionic tooling

You will need to have the Ionic CLI installed along with some other dependencies to build the app for devices. You can
install them with the following command:

```bash
npm install -g @ionic/cli native-run cordova-res
```

Additionally, install cocoapods as it is required by Ionic for iOS devices:

```bash
sudo gem install cocoapods
```

## Running the app

You're all set! To run the app locally, you can use the following commands:

```bash
npm install
npm run dev:ios
# or
npm run dev:android
```

The above commands will spin up the development server and ask you to choose your device among a list of connected
devices. Select the device you want to deploy the app to.  
For physical devices, if it is your first time deploying on this device, you might
get a prompt asking you to trust the computer or the developer. Accept it and the app will be deployed to your device.

If you want to use a physical Android device, please note that your device **needs to be connected to your computer with
a USB cable and have USB debugging enabled** (you can also use wireless debugging). Enabling
debugging mode is different for each device, so you might need to look up how to do it for your device. But it usually
requires
you to first activate the developer options by tapping multiple times on the build number in your phone settings. Then,
you can enable
USB debugging in the developer options.

You can also set your device to be the default one and skip the selection step. This works with both physical and
virtual devices. To do that, first get your device ID by running the following command:

```bash
ionic cap run android --list
# or
ionic cap run ios --list
```

You will need to set environment variable with the device ID:

```bash
export ANDROID_DEVICE=<your-device-id>
export IOS_DEVICE=<your-device-id>
```

You can now use the following commands to run the app on your device:

```bash
npm run dev:ios:device
# or
npm run dev:android:device
```

## Environment variables

There are some environment variables that you can set to customize the app during development. The project uses vite's 
environment variables management. The variables are intended for use in development only and should not be used in
production. You can copy the `.env.development` file to a `.env.development.local` file that will be automatically ignored by
git and set your custom variables there following the same format. The variables can then be accessed in the code using
`import.meta.env.VITE_VARIABLE_NAME`. For more information, you can refer to the [vite documentation](https://vitejs.dev/guide/env-and-mode).

| Variable                       | Type      | Default     | Description                                                                                                                                                                                |
|--------------------------------|-----------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `VITE_SKIP_ONBOARDING`         | `boolean` | `false`     | Skips the onboarding process and goes directly to the login screen. This requires `VITE_SKYPORTAL_TOKEN`, `VITE_SKY                                                                        |
| `VITE_SKYPORTAL_TOKEN`         | `string`  | `undefined` | The token to use to authenticate with the SkyPortal backend. This is required if `VITE_SKIP_ONBOARDING` is set to `true`.                                                                  |
| `VITE_SKYPORTAL_INSTANCE_URL`  | `string`  | `undefined` | The URL of the SkyPortal instance to connect to. This is required if `VITE_SKIP_ONBOARDING` is set to `true`.                                                                              |
| `VITE_SKYPORTAL_INSTANCE_NAME` | `string`  | `undefined` | The name of the SkyPortal instance to connect to. This is required if `VITE_SKIP_ONBOARDING` is set to `true`.                                                                             |
| `VITE_CLEAR_AUTH`              | `boolean` | `false`     | Clears the authentication token and instance URL from the local storage. This is useful when you want to reset the app to the onboarding state each time you start the development server. |



## Directory structure

### `src/`

The code is organized in modules. Each module has its own directory in the `src` folder. The modules contain code and
components related to the same feature or group of features. The `common/` directory contains shared utilities that are
used across the app.

### `ios/` and `android/`

These directories contain the native code for the iOS and Android versions of the app. They are generated by Capacitor
and should not be modified directly. They have to
be included in the version control system to be able to build the app for iOS and Android.

### `mock/`

This directory contains mock data that is used to develop and test the app without having to connect to a real backend.

### `doc/`

This directory contains documentation and images related to the project.
