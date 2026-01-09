import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import { useThemeStore } from "../store/useThemeStore";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);

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

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    const chatClient = StreamChat.getInstance(STREAM_API_KEY);

    const initChat = async () => {
      try {
        await chatClient.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const ch = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await ch.watch();

        setClient(chatClient);
        setChannel(ch);
      } catch (err) {
        console.error(err);
        toast.error("Failed to connect chat");
      }
    };

    initChat();

    return () => {
      chatClient.disconnectUser();
    };
  }, [authUser, tokenData, targetUserId]);

  const handleVideoCall = () => {
    const callId = [authUser._id, targetUserId].sort().join("-");
    navigate(`/call/${callId}`);
  };

  if (!client || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] w-full bg-base-100 relative">
      <Chat
        client={client}
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
