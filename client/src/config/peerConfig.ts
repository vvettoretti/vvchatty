import Peer from "peerjs";

export const peerConfig: Peer.PeerJSOption = {
  host: "webrtc.vvettoretti.com",
  path: "/myapp",
  secure: true,
};
