# Steps to create a react native app with expo :

### 1) Create A simple HTML page with [Dailymotion PLS](https://developers.dailymotion.com/player/#player-library-script) and upload it to have accessible link .

- **Example :** [https://staging.dmvs-apac.com/webview_test/index.html](https://staging.dmvs-apac.com/webview_test/index.html)
**Source Code :**

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>webview test</title>
</head>
<body style="margin: 0px;">
<div class="dm-player" playerId="x1bgs" owners="suaradotcom" sort="recent" ></div>

<!-- Please replace the library URL to include your unique Player library ID created with your account and accessed via the Partner HQ or REST API -->
<script src="https://geo.dailymotion.com/libs/player/x938as.js"></script>

<div id="my-dailymotion-player">My Player placeholder</div>
<script>
    // loadThePlayer is a funtion that will be called by react native props
    window.loadThePlayer = (dailymotion_info)=>{
        dailymotion
        .createPlayer('my-dailymotion-player', {
            video: dailymotion_info.videoId,
        })
        .then((player) => {
            window.ReactNativeWebView.postMessage("Player is created");
            window.player = player;
            player.on(dailymotion.events.VIDEO_PLAY,()=>{
                window.ReactNativeWebView.postMessage("played");
            });
            player.on(dailymotion.events.VIDEO_PAUSE,()=>{
                window.ReactNativeWebView.postMessage("paused");
            });
            player.on(dailymotion.events.AD_PLAY,()=>{
                window.ReactNativeWebView.postMessage("played");
            });
            player.on(dailymotion.events.AD_PAUSE,()=>{
                window.ReactNativeWebView.postMessage("paused");
            });
            player.on(dailymotion.events.PLAYER_VOLUMECHANGE,(state)=>{
                window.ReactNativeWebView.postMessage(state.playerIsMuted ? "muted":"unmuted");
            });
        })
        .catch((e) => console.error(e));
    }
    
</script>
</body>
</html>
```

- `window.loadThePlayer` function will be called by React native props so that `videoId`, `playlistId` can be sent via react-native component
- **WebView HTML** can communicate via `window.ReactNativeWebView.postMessage` method. This method only accepts one argument which must be a string.
- `window.player = player;` You can set player object to window level so React-native can call methods on player object like `player.play()`, `player.pause()` etc.

### 2) Create a simple React-native project

- You can use expo-cli to create a react native project.

```powershell
npm install -g expo-cli
npx create-expo-app dailymotion-react-native
```

- After creating the project you can run the project. This will start a development server for you.

```powershell
npx expo start
```

- Install the [Expo Go app](https://expo.dev/client) on your iOS or Android phone and connect to the same wireless network as your computer. On Android, use the Expo Go app to scan the QR code from your terminal to open your project. On iOS, use the built-in QR code scanner of the default iOS Camera app.

### 3) Update React Native Project :

- Since we will be using `[react-native-webview](https://www.npmjs.com/package/react-native-webview)` library, install it first .

```powershell
npm install --save [react-native-webview](https://www.npmjs.com/package/react-native-webview)
```

- Now create a simple react native component for WebView. `MyWeb.js`

```jsx
import React, { Component } from 'react';
import { WebView , Alert} from 'react-native-webview';

export default class MyWeb extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <WebView 
      source={{ uri: 'https://staging.dmvs-apac.com/webview_test/index.html' }} 
      onMessage={this.props.onMessage}
      ref={this.props.reference}
      injectedJavaScript={this.props.injectedInfo}
      />;
  }
}
```

- `onMessage` : This props can listen event sent from `webview-html` page via `window.ReactNativeWebView.postMessage` method.
- `ref` : This props is the reference of WebView component which can be used to sent method from `react-native app` to `webview-html` .
- `injectedJavaScript` : With props a simple JavaScript can be injected to `webview-html` which will be executed after html loaded.
- Update App.js to include `MyWeb` component for WebView. App.js

```jsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
// importing MyWeb component
import MyWeb from './Components/MyWeb';

export default function App() {
	// state for playPause button and mute buttons
  const [playPause, setPlayPause] = useState("pause");
  const [mute, setMute] = useState(true);
	// Event that captured from webview-html
  const onMessage = (event)=>{
    if(event.nativeEvent.data === "played"){
      setPlayPause("pause");
    }else if(event.nativeEvent.data === "paused"){
      setPlayPause("play");
    }else if(event.nativeEvent.data === "muted"){
      setMute(true);
    }else if(event.nativeEvent.data === "unmuted"){
      setMute(false);
    }
  }
	// webview component reference object
  let webRef;
	// On press/click of playpause button injecting javascript to apply method on player object
  const onPlayPause = ()=>{
    webRef.injectJavaScript(playPause==="play"?
      `
        window.player.play();
        true;
      `:
      `
        window.player.pause();
        true;
      `
    );
  }
	// On press/click of mute button injecting javascript to apply method on player object
  const onMute = ()=>{
    webRef.injectJavaScript(mute?
      `
        window.player.setMute(false)	
        true;
      `:
      `
        window.player.setMute(true);
        true;
      `
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={{fontSize: 20}}>Dailymotion react-native Test</Text>
      </View>
      
      <View style={styles.fixToText}>
        <Button
          title={playPause}
          onPress={onPlayPause}
        />
         <Button
          title={mute ? "unmute" : "mute"}
          onPress={onMute}
        /> 
      </View>
      <MyWeb  style={styles.webview}
        onMessage={onMessage}
        reference={(r) => (webRef = r)}
        injectedInfo={
          `
            window.loadThePlayer({
              videoId: "x84sh87"
            });
            true; // note: this is required, or you'll sometimes get silent failures
          `
        }
      />
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1/3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10
  },
  webview:{
    aspectRatio: 16/9,
    width: "100%",
  },
  console:{
    marginHorizontal: 20
  }
});
```

- As You can see, `injectedJavaScript` is added with  `window.loadThePlayer()` method which will be called inside `webview-html` to trigger the player loading.
- Also `webRef.injectedJavaScript` method is called on WebView reference object to apply method on player in `webview-html`.

### 4) Build the iOS and Android native projects

```powershell
# Build your native Android project
npx expo run:android
# Build your native iOS project
npx expo run:ios
```

- Ref: [https://docs.expo.dev/workflow/customizing/](https://docs.expo.dev/workflow/customizing/)

### GitHub Repo : https://github.com/DMVS-APAC/dailymotion-react-native

**Reference** : [https://github.com/react-native-webview/react-native-webview/blob/HEAD/docs/Guide.md](https://github.com/react-native-webview/react-native-webview/blob/HEAD/docs/Guide.md)
