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
production. You can copy the `.env.development` file to a `.env.development.local` file that will be automatically
ignored by
git and set your custom variables there following the same format. The variables can then be accessed in the code using
`import.meta.env.VITE_VARIABLE_NAME`. For more information, you can refer to
the [vite documentation](https://vitejs.dev/guide/env-and-mode).

| Variable                       | Type      | Default     | Description                                                                                                                                                                                |
|--------------------------------|-----------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `VITE_SKIP_ONBOARDING`         | `boolean` | `false`     | Skips the onboarding process and goes directly to the login screen. This requires `VITE_SKYPORTAL_TOKEN`, `VITE_SKYPORTAL_INSTANCE_URL`, and `VITE_SKYPORTAL_INSTANCE_NAME` to be defined  |
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

## Development guidelines

### Components

The React components are all located inside modules. If a component is being used in multiple modules, it should be in
the `common/` directory.
The only naming convention for the components of this repository is to use Pascal-case. However, to create a new
component, one should first create
a directory with the name and the component and put the actual component file inside of this directory. They can also
add a sass style file
with the same name as the component in this directory like so:

```bash
|- myModule
  |- NewComponent
    |- NewComponent.jsx
    |- NewComponent.scss
```

The components themselves are arrow function components with named exports.

```jsx
export const NewComponent = ({ paramA, paramB }) => {
  // Your component code here...
}
```

#### Styling

This project uses Sass for styling components. Although you should strive to use Ionic components as most as you can. As
they come with built-in styles that will integrate smoothly with the rest of the UI. You should try to write as little
styling code as you can and rely more on Ionic components. If you do need some custom styles, a good practice is to
always give a style class to your component's top-level element. For example in the CandidateScanner component:

```jsx
return (
  <div className="candidate-scanner">
    {/* ... */}
  </div>
);
```

And then in CandidateScanner.scss, we have:

```scss
.candidate-scanner {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 90% 10%;
  height: 100%;

  .embla {
    // ...
  }

  .action-buttons-container {
    // ...
  }
}
```

Do not forget to import the style file in your React component by adding:

```jsx
import "./CandidateScanner.scss";
```

If you need to define global styles, you can put them in the `global.scss` file.

#### Theming

In addition to the styles built into its components, Ionic also provides css variables that you can use in your own
custom styles like `--ion-color-primary` or `--ion-safe-area-top`. You can find more about this on
the [Ionic website](https://www.figma.com/community/plugin/1034969338659738588/material-theme-builder). Ionic also
allows overriding some of these variables
values by providing your own. This is how the color theme for this application has been defined. You can find all the
theme colors in the `theme/variables.scss` file. You should only use theme colors in your components as they will also
automatically adapt to dark theme. The theme colors in this project have been generated using
the [Material Theme Builder](https://www.figma.com/community/plugin/1034969338659738588/material-theme-builder) Figma
plugin. So they respect accessibility standards and also just work well together.

#### Screen components

In any React application you have some components that make up entire screens by composing other components. These
screen components are then used in the routing of the application as destinations. With Ionic, a screen component needs
to be wrapped into an `<IonPage>`. This will ensure the component will have the expected behavior when the user
navigates to it. The basic layout of an `<IonPage>` is as follows:

```jsx
<IonPage>
  <IonHeader>
    {/* ... */}
  </IonHeader>
  <IonContent>
    {/* ... */}
  </IonContent>
</IonPage>
```

The `<IonHeader>` can contain an `<IonToolbar>` with an `<IonTitle>` like this:

```jsx
<IonHeader>
  <IonToolbar>
    <IonTitle>Title</IonTitle>
  </IonToolbar>
</IonHeader>
```

And the `<IonContent>` contains the body of your page.

#### Skeleton components

Ionic provides an easy way to create skeletons. This offers a better experience than a basic loader as users can have an
idea
of what is gonna be displayed. A good practice is that, if you have a loading delay and you already know what is going
to be displayed after it,
you can create a skeleton for this content instead of displaying a loader. You can use the same styling file as the real
component for this and
if you do, you should include the skeleton file in the same directory as your component:

```bash
|- myModule
  |- NewComponent
    |- NewComponent.jsx
    |- NewComponent.scss
    |- NewComponentSkeleton.jsx
```

### Modules

Modules help keeping the code base organized and enhance scalability. The contain components and code that are related
together. The naming convention for modules is to use camel-case. Module names should be short and descriptive. They
usually
refer to a specific part of the application or a group of related functionalities. A module in this repository
has the following structure:

```bash
|- myModule
  |- Component1
  |- Component2
  |- Component3
  |- myModult.lib.js
  |- myModule.hooks.js
  |- myModule.requests.js
```

Other than the component directories, there are three files that can be added to the module.

- `myModule.lib.js` contains all the business logic of the module. Here you can put functions, constants and types that
  are being used by the components of this module.
- `myModule.hooks.js` contains all the hooks being used in this module. Every TanStack queries should be defined there
  as well as other needed hooks.
- `myModule.requests.js` contains all the network requests of this module.

Normally, the dependencies between these 3 files should be in this order `myModult.lib.js` -> `myModule.hooks.js` ->
`myModule.requests.js`. If you end up with a different order of dependencies make sure that all of your hooks are in
the `myModule.hooks.js` and that all the logic is in `myModule.lib.js`.

### State

There is no state management library in this repository. The app only relies on TanStack Query to get the state from the
SkyPortal instance backend. This allows for less code to write and requires that every piece of data needed by a
component be made available through a TanStack query.

#### Example

Some components in the module need access to the user's accessible groups. A request `fetchGroups` has been created in
the `common.requests.js` file:

```js
export async function fetchGroups(userInfo) {
  let response = await CapacitorHttp.get({
    url: `${userInfo.instance.url}/api/groups`,
    headers: {
      Authorization: `token ${userInfo.token}`,
    },
  });
  return response.data.data;
}
```

Then in the `common.hooks.js` file we have defined a `useUserAccessibleGroups` hook:

```js
export const useUserAccessibleGroups = () => {
  const {
    status,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: () => fetchGroups(),
  });
  return {
    userAccessibleGroups: groups?.user_accessible_groups,
    status,
    error,
  };
};
```

It uses a key defined on the `QUERY_KEYS` constant. This is very important, you should always use this `QUERY_KEYS` in
the `queryKey` field of your request as it will help you keep track of them and each of your keys should be unique.
Failing to do so will produce unexpected results with TanStack Query.  
Finally, we can use our new hook in a component. For example in the `RecentProfiles` component:

```js
export const RecentProfiles = () => {
  // ...
  const { userAccessibleGroups } = useUserAccessibleGroups();

  return (
    <div className="scanning-profiles">
      {/* ... */}
      <div className="sp-content">
        {profiles && userAccessibleGroups && (<>{/* ... */}</>)}
        {(!profiles || !userAccessibleGroups) && <IonLoading/>}
      </div>
      {/* ... */}
    </div>
  );
};
```

The data from a TanStack query is undefined until the query completes so you have to check its value before using it.

This approach eliminates the need for a state management library. TanStack Query also caches the data it fetches and
automatically invalidates this cache after some time or after an action has been taken. You can read more about TanStack
Query on its [official website](https://tanstack.com/query/latest/docs/framework/react/overview).

The only exception to this pattern in the application is the `userInfo`. `userInfo` stores the token and instance of the user. The user provides them when they log in, and it is then stored in the application's preferences for the next app launches. At every app launch, the `userInfo` is fetched from the preferences and propagated through the whole application using the React Context API. As you can see in App.jsx:
```jsx
const { data } = useAppStart();
return (
  <UserContext.Provider
    value={
      data.userInfo ?? {
        instance: { name: "", url: "" },
        token: ""
      }
    }
  >
    <IonApp>
      {/* ... */}
    </IonApp>
  </UserContext.Provider>
);
```