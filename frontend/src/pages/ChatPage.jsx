import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";

import {
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { useThemeStore } from "../store/useThemeStore";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const darkThemes = [
    "dark","forest","halloween","business","black","luxury",
    "night","dracula","synthwave","sunset","dim","coffee","abyss",
  ];
  const isDark = darkThemes.includes(theme);

  // ---------------- CHAT INIT ----------------
  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    const client = StreamChat.getInstance(STREAM_API_KEY);

    const initChat = async () => {
      try {
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const ch = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await ch.watch();

        setChatClient(client);
        setChannel(ch);
      } catch (err) {
        console.error(err);
        toast.error("Failed to connect chat");
      }
    };

    initChat();

    return () => {
      client.disconnectUser();
    };
  }, [authUser, tokenData, targetUserId]);

  // ---------------- VIDEO CALL ----------------
  const handleVideoCall = async () => {
    if (!authUser || !tokenData?.token) return;

    try {
      const video = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        token: tokenData.token,
      });

      const callId = [authUser._id, targetUserId].sort().join("-");

      const newCall = video.call("default", callId);
      await newCall.join({ create: true });

      setVideoClient(video);
      setCall(newCall);
    } catch (error) {
      console.error(error);
      toast.error("Video call failed");
    }
  };

  const endCall = async () => {
    if (call) await call.leave();
    if (videoClient) await videoClient.disconnectUser();

    setCall(null);
    setVideoClient(null);
  };

  if (!chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] w-full bg-base-100 relative">

      {call && (
        <div className="absolute inset-0 z-50 bg-black">
          <StreamCall call={call}>
            <SpeakerLayout />
            <CallControls onLeave={endCall} />
          </StreamCall>
        </div>
      )}

      <Chat
        client={chatClient}
        theme={isDark ? "messaging dark" : "messaging light"}
      >
        <Channel channel={channel}>
          <CallButton handleVideoCall={handleVideoCall} />
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
