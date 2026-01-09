import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

import {
  getFriendRequests,
  acceptFriendRequest,
  getStreamToken,
} from "../lib/api";

import { StreamVideoClient } from "@stream-io/video-react-sdk";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isChatPage = location.pathname?.startsWith("/chat");

  const { data: friendRequestsRaw = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const friendRequests = friendRequestsRaw.filter(
    (req) => req && req.sender
  );

  const { mutate: acceptRequest } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const videoClientRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!authUser || videoClientRef.current) return;

    let active = true;

    const initVideoClient = async () => {
      try {
        const { token } = await getStreamToken();
        if (!active) return;

        const client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token,
        });

        client.on("call.created", (event) => {
          setIncomingCall({
            callId: event.call.id,
            from: event.call.created_by?.name || "Someone",
          });
        });

        videoClientRef.current = client;
      } catch (err) {
        console.error("Video client init failed:", err);
      }
    };

    initVideoClient();

    return () => {
      active = false;
      if (videoClientRef.current) {
        videoClientRef.current.disconnectUser();
        videoClientRef.current = null;
      }
    };
  }, [authUser]);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="w-full px-4 flex justify-between">

        <Link to="/" className="flex items-center gap-2">
          <img src="/setu-logo.png" className="w-7 h-7" />
          <span className="font-bold">Setu</span>
        </Link>

        <div className="flex items-center gap-4">

          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle relative">
              <BellIcon className="h-6 w-6" />
              {(friendRequests.length > 0 || incomingCall) && (
                <span className="badge badge-error badge-sm absolute -top-1 -right-1">
                  {friendRequests.length + (incomingCall ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="dropdown-content w-80 p-3 bg-base-100 shadow rounded-box">

              {incomingCall && (
                <div className="bg-warning/20 p-2 rounded mb-2">
                  <p className="text-sm">📞 {incomingCall.from} is calling</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="btn btn-success btn-xs"
                      onClick={() => navigate(`/call/${incomingCall.callId}`)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => setIncomingCall(null)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {friendRequests.map((req) => (
                <div key={req._id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={req.sender.profilePic || "/avatar.png"}
                      className="w-9 h-9 rounded-full"
                    />
                    <p className="text-sm">{req.sender.fullName}</p>
                  </div>
                  <button
                    className="btn btn-success btn-xs"
                    onClick={() => acceptRequest(req._id)}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>

          <ThemeSelector />

          <button onClick={logoutMutation} className="btn btn-ghost btn-circle text-error">
            <LogOutIcon />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
