import { AspectRatio, Button, Flex, Grid } from "@chakra-ui/react";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import NavBar from "./components/NavBar";
import { peerConfig } from "./config/peerConfig";
import useWebcam from "./hooks/useWebcam";
import showVideo from "./utils/showVideo";

const socket = io("localhost:4000");
let peer: Peer;
let peerCall: Peer.MediaConnection | undefined;

const App = () => {
  const { webcamMediaStream, webcamVideo } = useWebcam();
  const callerVideo = useRef<HTMLVideoElement>(null);
  const [searching, setSearching] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // SocketIo setup

    socket.on("connect", () => {
      //PeerJS Setup
      peer = new Peer(socket.id, peerConfig);

      peer.on("call", (call) => {
        call.answer(webcamMediaStream.current);
        call.on("stream", (stream) => {
          showVideo(stream, false, callerVideo);
        });
      });
    });
    socket.on("userCount", (data: number) => {
      setOnlineCount(data);
    });

    socket.on("startChat", (data: { caller: string; accepter: string }) => {
      setSearching(false);
      if (!webcamMediaStream.current) return;
      if (data.caller === socket.id) {
        console.log("startChat", data, peer.id);

        peerCall = peer.call(data.accepter, webcamMediaStream.current);
        peerCall.on("stream", (stream) => {
          showVideo(stream, false, callerVideo);
        });
      }
    });

    socket.on("stopChat", () => {
      peerCall?.close();
      peerCall = undefined;
      showVideo(null, false, callerVideo);
    });
  }, []);

  const startSearch = () => {
    if (peerCall) {
      peerCall.close();
      peerCall = undefined;
      socket.emit("stopChat");
      showVideo(null, false, callerVideo);
    }
    socket.emit("startSearch");
    setSearching(true);
  };

  const stopSearch = () => {
    socket.emit("stopChat");
    peerCall?.close();
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
