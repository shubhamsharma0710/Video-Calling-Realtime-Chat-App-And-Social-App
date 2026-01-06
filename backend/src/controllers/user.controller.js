import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

/**
 * GET /users
 * Recommended users (not friends, not self)
 */
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).select("friends");

    const recommendedUsers = await User.find({
      _id: {
        $ne: currentUserId,
        $nin: currentUser.friends || [],
      },
      isOnboarded: true,
    }).select("fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("getRecommendedUsers error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * GET /users/friends
 * My friends list
 */
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("getMyFriends error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * POST /users/friend-request/:id
 */
export async function sendFriendRequest(req, res) {
  try {
    const senderId = req.user._id;
    const recipientId = req.params.id;

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ message: "You cannot send request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const request = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("sendFriendRequest error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * PUT /users/friend-request/:id/accept
 */
export async function acceptFriendRequest(req, res) {
  try {
    const requestId = req.params.id;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.recipient },
    });

    await User.findByIdAndUpdate(request.recipient, {
      $addToSet: { friends: request.sender },
    });

    // 🔥 DELETE request after accepting (IMPORTANT)
    await request.deleteOne();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("acceptFriendRequest error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * GET /users/friend-requests
 */
export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(incomingReqs);
  } catch (error) {
    console.error("getFriendRequests error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * GET /users/outgoing-friend-requests
 */
export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user._id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("getOutgoingFriendReqs error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
