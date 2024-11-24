import { ObjectId } from "mongodb";
import chat from "../../models/chat.js";
import validation from "../../utils/validation.js";
let exprtedMethod = {
  async saveChat(sender_id, receiver_id, message) {
    validation.checkId(sender_id);
    validation.checkId(receiver_id);
    message = validation.checkString(message);
    sender_id = new ObjectId(sender_id);
    receiver_id = new ObjectId(receiver_id);
    let newChat = new chat({
      sender_id: sender_id,
      receiver_id: receiver_id,
      message: message,
    });

    const savedChat = await newChat.save();
    return savedChat;
  },
};

export default exprtedMethod;
