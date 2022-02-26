import {
  Button,
  Flex,
  Input,
  InputGroup,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import MessageBox from "./components/MessageBox";
import NavBar from "./components/NavBar";
import VideoPreview from "./components/VideoPreview";
import { peerConfig } from "./config/peerConfig";
import { socketConfig } from "./config/socketConfig";
import useWebcam from "./hooks/useWebcam";
import showVideo from "./utils/showVideo";

const socket = io(socketConfig);
let peer: Peer;
let peerCall: Peer.MediaConnection | undefined;

const App = () => {
  const { webcamMediaStream, webcamVideo } = useWebcam();
  const callerVideo = useRef<HTMLVideoElement>(null);
  const [searching, setSearching] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [messages, setMessages] = useState<{ text: string; mine: boolean }[]>(
    []
  );
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
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
      setMessages([]);
    });

    socket.on("chatMessage", (data) => {
      console.log(messages);
      setMessages((messages) => [...messages, { text: data, mine: false }]);
    });
  }, []);

  const startSearch = () => {
    if (peerCall) {
      peerCall.close();
      peerCall = undefined;
      socket.emit("stopChat");
      showVideo(null, false, callerVideo);
      setMessages([]);
    }
    socket.emit("startSearch");
    setSearching(true);
  };

  const stopSearch = () => {
    socket.emit("stopChat");
    peerCall?.close();
    showVideo(null, false, callerVideo);
    setSearching(false);
    setMessages([]);
  };

  const sendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (currentMessage && e.key === "Enter") {
      socket.emit("chatMessage", currentMessage);
      setMessages((messages) => {
        return [...(messages || []), { text: currentMessage, mine: true }];
      });
      setCurrentMessage("");
    }
  };

  return (
    <>
      <NavBar onlineCount={onlineCount}></NavBar>
      <Flex gap="3" p="3" flexDir={["column", "row"]}>
        <VideoPreview videoRef={webcamVideo} />
        <VideoPreview videoRef={callerVideo} />
      </Flex>

      <SimpleGrid columns={[1, 2]} p="3" gap="3">
        <Flex flexDir="column" gap="4">
          <Button
            onClick={startSearch}
            width="100%"
            height="28"
            disabled={searching}
          >
            <Text fontSize="lg">Search</Text>
          </Button>
          <Button onClick={stopSearch} width="100%" height="28">
            <Text fontSize="xl">Stop</Text>
          </Button>
        </Flex>
        <Flex flexDir="column" height={["40vh", "60"]}>
          <Flex
            borderWidth="thin"
            borderTopRadius="md"
            overflow="auto"
            height="100%"
            flexDir="column"
          >
            {messages?.map((message) => {
              return (
                <MessageBox message={message} key={messages.indexOf(message)} />
              );
            })}
          </Flex>
          <InputGroup>
            <Input
              placeholder="Type a message"
              borderTopRadius="0"
              borderTop="0"
              value={currentMessage}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
              }}
              onKeyUp={sendMessage}
            />
          </InputGroup>
        </Flex>
      </SimpleGrid>
    </>
  );
};

export default App;
