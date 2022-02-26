export const userMediaConfig: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: { facingMode: "user" },
};
