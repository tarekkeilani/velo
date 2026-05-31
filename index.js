/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { registerGlobals } from 'react-native-webrtc';
import App from './App';
import { name as appName } from './app.json';

// Sets up the WebRTC globals (RTCPeerConnection, mediaDevices, …) on the RN
// JS runtime. Must run once before any call logic.
registerGlobals();

AppRegistry.registerComponent(appName, () => App);
