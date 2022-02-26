import { AspectRatio } from "@chakra-ui/react";

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoRef }) => {
  return (
    <AspectRatio width={["100%", "50%"]} maxH="xl" ratio={4 / 3} flex="auto">
      <video ref={videoRef} playsInline></video>
    </AspectRatio>
  );
};
export default VideoPreview;
