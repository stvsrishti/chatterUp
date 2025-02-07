import mongoose from "mongoose";
// Chat Schema to add messages and user in chat
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Some text is required"],
  },
  message: String,
  time: Date,
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
