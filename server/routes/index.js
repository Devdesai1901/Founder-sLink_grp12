import investorPaths from "./investorPath.js";
import founderPaths from "./foundersPath.js";
import chatPaths from "./chatPath.js";
import meetPaths from "./meetPath.js";
import authRoutes from "./authRoutes.js";
import feedPaths from "./feedPath.js";


const constructorMethod = (app) => {
  app.use("/", authRoutes);
  app.use("/founder", founderPaths);
  app.use("/investor", investorPaths);
  app.use("/save-chat", chatPaths);
  app.use("/video-call", meetPaths);
  app.use("/feed", feedPaths);
  app.use("*", (req, res) => {
    return res.status(404).json({ error: "page not found" });
  });
};

export default constructorMethod;
