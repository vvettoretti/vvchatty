import { useEffect, useRef, useState } from "react";
import { userMediaConfig } from "../config/userMediaConfig";
import showVideo from "../utils/showVideo";

const useWebcam = () => {
  const webcamVideo = useRef<HTMLVideoElement>(null);
  const webcamMediaStream = useRef<MediaStream>();
  useEffect(() => {
    navigator.mediaDevices.getUserMedia(userMediaConfig).then((stream) => {
      webcamMediaStream.current = stream;
      showVideo(stream, true, webcamVideo);
    });
    return () => {};
  });
  return { webcamMediaStream, webcamVideo };
};
export default useWebcam;
