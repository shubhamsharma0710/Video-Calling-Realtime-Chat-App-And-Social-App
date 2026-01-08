import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HomeIcon, UsersIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { getFriendRequests, acceptFriendRequest } from "../lib/api";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const queryClient = useQueryClient();

  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled: !!authUser,
  });

  const { mutate: acceptFriend } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  return (
    <aside className="w-64 flex-shrink-0 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/setu-logo.png"
            alt="Setu Logo"
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold">Setu</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5" />
          Home
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5" />
          Friends
        </Link>
      </nav>

      {friendRequests.length > 0 && (
        <div className="p-4 border-t border-base-300">
          <p className="text-xs font-semibold mb-2 opacity-70">
            Friend Requests
          </p>

          <div className="space-y-2">
            {friendRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={req.sender.profilePic}
                    alt={req.sender.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm truncate">
                    {req.sender.fullName}
                  </span>
                </div>

                <button
                  onClick={() => acceptFriend(req._id)}
                  className="btn btn-success btn-xs"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
