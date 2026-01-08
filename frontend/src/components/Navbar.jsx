import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import {
  getFriendRequests,
  acceptFriendRequest,
} from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
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
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {friendRequests.length}
                  </span>
                )}
              </button>

              <div
                tabIndex={0}
                className="dropdown-content mt-3 w-80 rounded-box bg-base-100 shadow-xl p-3"
              >
                <p className="font-semibold mb-2">Notifications</p>

                {friendRequests.length === 0 && (
                  <p className="text-sm opacity-70">
                    No new notifications
                  </p>
                )}

                {friendRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between gap-2 py-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={req.sender.profilePic}
                        alt={req.sender.fullName}
                        className="w-9 h-9 rounded-full"
                      />
                      <div className="truncate">
                        <p className="text-sm font-medium truncate">
                          {req.sender.fullName}
                        </p>
                        <p className="text-xs opacity-60">
                          sent you a friend request
                        </p>
                      </div>
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
