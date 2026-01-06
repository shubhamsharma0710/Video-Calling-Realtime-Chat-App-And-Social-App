import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);
  if (!request) {
    return res.status(404).json({ message: "Friend request not found" });
  }

  // add each other as friends
  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { friends: request.receiver },
  });

  await User.findByIdAndUpdate(request.receiver, {
    $addToSet: { friends: request.sender },
  });

  await request.deleteOne();

  res.status(200).json({ message: "Friend added successfully" });
};
