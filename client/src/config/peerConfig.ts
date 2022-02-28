import Peer from "peerjs";

export const peerConfig: Peer.PeerJSOption = {
  host: "webrtc.vvettoretti.dev",
  path: "/myapp",
  secure: true,
  config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
};
