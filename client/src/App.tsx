import { AspectRatio, Button, Flex, Grid } from "@chakra-ui/react";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import NavBar from "./components/NavBar";
import { peerConfig } from "./config/peerConfig";
import useWebcam from "./hooks/useWebcam";
import showVideo from "./utils/showVideo";

const App = () => {
  const { webcamMediaStream, webcamVideo } = useWebcam();
  const callerVideo = useRef<HTMLVideoElement>(null);
  const socket = useRef<Socket>();
  const peer = useRef<Peer>();
  const peerCall = useRef<Peer.MediaConnection>();
  const [searching, setSearching] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // SocketIo setup
    socket.current = io("localhost:4000");

    socket.current.on("connect", () => {
      // PeerJS setup
      peer.current = new Peer(socket.current?.id, peerConfig);
      peer.current.on("call", (call) => {
        call.answer(webcamMediaStream.current);
        call.on("stream", (stream) => {
          showVideo(stream, false, callerVideo);
        });
      });
    });

    socket.current.on("userCount", (data: number) => {
      setOnlineCount(data);
    });

    socket.current.on(
      "startChat",
      (data: { caller: string; accepter: string }) => {
        setSearching(false);
        if (!webcamMediaStream.current) return;
        if (data.caller === socket.current?.id) {
          console.log("startChat", data, peer.current?.id);

          peerCall.current = peer.current?.call(
            data.accepter,
            webcamMediaStream.current
          );
          peerCall.current?.on("stream", (stream) => {
            showVideo(stream, false, callerVideo);
          });
        }
      }
    );

    socket.current.on("stopChat", () => {
      peerCall.current?.close();
      peerCall.current = undefined;
      showVideo(null, false, callerVideo);
    });
  }, []);

  const startSearch = () => {
    if (peerCall.current) {
      peerCall.current.close();
      peerCall.current = undefined;
      socket.current?.emit("stopChat");
      showVideo(null, false, callerVideo);
    }
    socket.current?.emit("startSearch");
    setSearching(true);
  };

  const stopSearch = () => {
    socket.current?.emit("stopChat");
    peerCall.current?.close();
    showVideo(null, false, callerVideo);
    setSearching(false);
  };

  return (
    <div>
      <NavBar onlineCount={onlineCount}></NavBar>
      <Flex gap="3" p="3" flexDir={["column", "row"]}>
        <AspectRatio width={["100%", "50%"]} ratio={4 / 3} flex="auto">
          <video ref={webcamVideo} playsInline></video>
        </AspectRatio>
        <AspectRatio width={["100%", "50%"]} ratio={4 / 3} flex="auto">
          <video ref={callerVideo} playsInline></video>
        </AspectRatio>
      </Flex>
      <Flex flexDir="column" p="3" gap="3">
        <Button
          onClick={startSearch}
          width={["100%", "50%"]}
          disabled={searching}
        >
          Search
        </Button>
        <Button onClick={stopSearch} width={["100%", "50%"]}>
          Stop
        </Button>
      </Flex>
    </div>
  );
};

export default App;
