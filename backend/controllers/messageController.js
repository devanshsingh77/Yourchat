const Message = require("../models/messageModel");

// SEND MESSAGE
const sendMessage = async (req, res) => {
  const { content, receiver } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    receiver,
    content,
    seen: false,
  });

  res.json(message);
};

// GET MESSAGES + MARK AS SEEN
const getMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.id },
      { sender: req.params.id, receiver: req.user._id },
    ],
  }).sort({ createdAt: 1 });

  // MARK AS SEEN
  await Message.updateMany(
    {
      sender: req.params.id,
      receiver: req.user._id,
      seen: false,
    },
    { seen: true }
  );

  res.json(messages);
};

module.exports = { sendMessage, getMessages };