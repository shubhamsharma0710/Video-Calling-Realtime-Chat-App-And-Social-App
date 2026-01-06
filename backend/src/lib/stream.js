import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  await streamClient.upsertUsers([userData]);
  return userData;
};

export const generateStreamToken = (userId) => {
  const userIdStr = userId.toString();
  return streamClient.createToken(userIdStr);
};
