import { Router } from "express";
const router = Router();

router.route("/").get((req, res) => {
  try {
    res.render("common/video", { layout: false });
    console.log("Rendered video.handlebars successfully.");
  } catch (e) {
    console.error("Error rendering video.handlebars:", e);
    return res.send(400).json({ error: "error in staring meeting" });
  }
});

export default router;
