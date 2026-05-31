/**
 * Manual mock for react-native-webrtc.
 *
 * The real package is a native module that can't load under Jest/Node, so this
 * stub stands in. It models just enough of the surface (media, tracks, peer
 * connection) for components to render and for logic to run in tests. Jest
 * picks this up automatically because it lives in <rootDir>/__mocks__.
 */

class MediaStreamTrack {
  constructor(kind) {
    this.kind = kind;
    this.enabled = true;
    this.readyState = 'live';
  }
  stop() {
    this.readyState = 'ended';
  }
  _switchCamera() {}
  applyConstraints() {
    return Promise.resolve();
  }
}

class MediaStream {
  constructor() {
    this._tracks = [
      new MediaStreamTrack('audio'),
      new MediaStreamTrack('video'),
    ];
    this.id = 'mock-stream';
  }
  toURL() {
    return 'mock://stream';
  }
  getTracks() {
    return this._tracks;
  }
  getAudioTracks() {
    return this._tracks.filter(t => t.kind === 'audio');
  }
  getVideoTracks() {
    return this._tracks.filter(t => t.kind === 'video');
  }
  addTrack(t) {
    this._tracks.push(t);
  }
  release() {}
}

const mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve(new MediaStream())),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
};

class RTCPeerConnection {
  constructor() {
    this.localDescription = null;
    this.remoteDescription = null;
    this.connectionState = 'new';
  }
  addEventListener() {}
  removeEventListener() {}
  addTrack() {}
  createOffer() {
    return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' });
  }
  createAnswer() {
    return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' });
  }
  setLocalDescription(d) {
    this.localDescription = d;
    return Promise.resolve();
  }
  setRemoteDescription(d) {
    this.remoteDescription = d;
    return Promise.resolve();
  }
  addIceCandidate() {
    return Promise.resolve();
  }
  close() {}
  getSenders() {
    return [];
  }
}

class RTCSessionDescription {
  constructor(init) {
    Object.assign(this, init);
  }
}
class RTCIceCandidate {
  constructor(init) {
    Object.assign(this, init);
  }
}

// RTCView renders nothing in tests.
const RTCView = () => null;

module.exports = {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCView,
  registerGlobals: () => {},
};
