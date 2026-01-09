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

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

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
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center backdrop-blur-lg bg-opacity-90">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          <div className={`flex items-center gap-3 ${!isChatPage ? "lg:hidden" : "flex"}`}>
            <Link to="/" className="flex items-center gap-2">
              <img src="/setu-logo.png" alt="Setu" className="w-7 h-7" />
              <span className="text-xl font-bold">Setu</span>
            </Link>
          </div>

          {!isChatPage && <div className="hidden lg:block" />}

          <div className="flex items-center gap-3 sm:gap-4">

            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost btn-circle relative" tabIndex={0}>
                <BellIcon className="h-6 w-6 opacity-70" />
                {(friendRequests.length > 0 || incomingCall) && (
                  <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {friendRequests.length + (incomingCall ? 1 : 0)}
                  </span>
                )}
              </button>

              <div
                tabIndex={0}
                className="dropdown-content mt-3 w-80 rounded-box bg-base-100 shadow-xl p-3"
              >
                <p className="font-semibold mb-2">Notifications</p>

                {incomingCall && (
                  <div className="flex items-center justify-between gap-2 py-2 bg-warning/20 rounded px-2 mb-2">
                    <p className="text-sm font-semibold">
                      📞 {incomingCall.from} is calling
                    </p>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => {
                          navigate(`/call/${incomingCall.callId}`);
                          setIncomingCall(null);
                        }}
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

                {friendRequests.length === 0 && !incomingCall && (
                  <p className="text-sm opacity-70">No new notifications</p>
                )}

                {friendRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between gap-2 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={req.sender.profilePic}
                        alt={req.sender.fullName}
                        className="w-9 h-9 rounded-full"
                      />
                      <p className="text-sm truncate">
                        {req.sender.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => acceptRequest(req._id)}
                      className="btn btn-success btn-xs"
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <ThemeSelector />

            <button
              className="btn btn-ghost btn-circle text-error"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-6 w-6 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
