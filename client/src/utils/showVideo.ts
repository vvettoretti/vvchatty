const showVideo = (
  mediaStream: MediaStream | null,
  muted: boolean,
  streamRef: React.RefObject<HTMLVideoElement>
) => {
  if (streamRef.current) {
    streamRef.current.srcObject = mediaStream;
    streamRef.current.muted = muted;
    streamRef.current.autoplay = true;
  }
};

export default showVideo;
