import { StreamChat } from "stream-chat";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

let client = null;

export const getStreamClient = () => {
  if (!client) {
    client = StreamChat.getInstance(STREAM_API_KEY);
  }
  return client;
};
