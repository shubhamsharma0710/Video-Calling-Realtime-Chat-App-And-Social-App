import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axiosInstance.get("/users/friends");
        
        const safeFriends = Array.isArray(res.data)
          ? res.data.filter(Boolean)
          : [];
        setFriends(safeFriends);
      } catch (error) {
        console.error("Fetch friends error:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>

      {friends.length === 0 ? (
        <p className="opacity-70">No friends found</p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li
              key={friend._id}
              className="bg-base-200 p-4 rounded-lg flex items-center gap-4"
            >
              <img
                src={friend.profilePic || "/avatar.png"}
                alt={friend.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{friend.fullName}</p>
                <p className="text-sm opacity-70">{friend.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsPage;
