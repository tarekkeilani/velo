/**
 * @format
 */

// MUST be first: replaces React Native's incomplete global URL with a
// spec-compliant one. supabase-js assigns to url.protocol, which throws on
// RN's built-in URL ("has only a getter"). Loading this before anything else
// fixes that at the root.
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import { registerGlobals } from 'react-native-webrtc';
import App from './App';
import { name as appName } from './app.json';

// Sets up the WebRTC globals (RTCPeerConnection, mediaDevices, …) on the RN
// JS runtime. Must run once before any call logic.
registerGlobals();

AppRegistry.registerComponent(appName, () => App);
