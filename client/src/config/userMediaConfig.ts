export const userMediaConfig: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: { facingMode: "user", width: 1280, height: 720 },
};
