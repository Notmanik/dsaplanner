const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/friends/search/:code
router.get('/search/:code', auth, async (req, res) => {
  try {
    const user = await User.findOne({ uniqueCode: req.params.code.toUpperCase() })
      .select('username uniqueCode _id streak');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found with this code' });
    }
    
    // Prevent searching for yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'You cannot add yourself' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/friends/request
router.post('/request', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    if (!targetUserId) return res.status(400).json({ msg: 'Target user ID is required' });
    if (targetUserId === req.user.id) return res.status(400).json({ msg: 'Cannot send request to yourself' });

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({ msg: 'You are already friends' });
    }

    if (targetUser.friendRequests.includes(req.user.id)) {
        return res.status(400).json({ msg: 'Friend request already sent' });
    }

    targetUser.friendRequests.push(req.user.id);
    await targetUser.save();

    // Socket.io standard emit to the target user if online
    if (req.io && req.connectedUsers) {
        const socketId = req.connectedUsers.get(targetUser._id.toString());
        if (socketId) {
            req.io.to(socketId).emit('friend_request_received', {
                from: currentUser.username,
                fromId: currentUser._id,
            });
        }
    }

    res.json({ msg: 'Friend request sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/friends/request/:id/accept
router.put('/request/:id/accept', auth, async (req, res) => {
  try {
    const senderId = req.params.id;
    const currentUser = await User.findById(req.user.id);
    const senderUser = await User.findById(senderId);

    if (!currentUser || !senderUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if request exists
    if (!currentUser.friendRequests.includes(senderId)) {
        return res.status(400).json({ msg: 'Friend request not found' });
    }

    // Remove from requests, add to friends for current user
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== senderId);
    if (!currentUser.friends.includes(senderId)) currentUser.friends.push(senderId);

    // Add to friends for sender user
    if (!senderUser.friends.includes(req.user.id)) senderUser.friends.push(req.user.id);

    await currentUser.save();
    await senderUser.save();

    // Socket.io emit back to sender
    if (req.io && req.connectedUsers) {
        const socketId = req.connectedUsers.get(senderUser._id.toString());
        if (socketId) {
            req.io.to(socketId).emit('friend_request_accepted', {
                by: currentUser.username,
                byId: currentUser._id,
            });
        }
    }

    res.json({ msg: 'Friend request accepted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/friends/request/:id/reject
router.delete('/request/:id/reject', auth, async (req, res) => {
  try {
    const senderId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== senderId);
    await currentUser.save();

    res.json({ msg: 'Friend request rejected' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/friends/leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('streak username uniqueCode');
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });

    // Find all friends
    const friends = await User.find({ _id: { $in: currentUser.friends } })
        .select('streak username uniqueCode');

    // Combine current user and friends
    const leaderboard = [currentUser, ...friends];

    // Sort descending by streak
    leaderboard.sort((a, b) => b.streak - a.streak);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/friends/pending
router.get('/pending', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).populate('friendRequests', 'username uniqueCode streak');
        if (!currentUser) return res.status(404).json({ msg: 'User not found' });
        
        res.json(currentUser.friendRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/friends/me
router.get('/me', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).select('uniqueCode');
        if (!currentUser) return res.status(404).json({ msg: 'User not found' });
        
        res.json({ uniqueCode: currentUser.uniqueCode });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
