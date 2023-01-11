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