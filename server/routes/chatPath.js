import { Router } from "express";
import chatMethod from "../controllers/common/chatData.js";
import validation from "../utils/validation.js";
const router = Router();
router
  .route("/")
  .post(async (req, res) => {
    try {
      let senderId = req.body.sender_id;
      let reciverId = req.body.receiver_id;
      let messg = req.body.message;

      validation.checkId(senderId);

      validation.checkId(reciverId);

      messg = validation.checkString(messg);
      let saveData = await chatMethod.saveChat(senderId, reciverId, messg);
      res
        .status(200)
        .send({ success: true, msg: "chatInserted", data: saveData });
    } catch (e) {
      return res.status(400).json({ error: "unable to save chat" });
    }
  })
  .put();
export default router;
