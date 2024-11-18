import founderPaths from "./InvestorPath.js";
import investorPaths from "./foundersPath.js";

const constructorMethod = (app) => {
  app.use("/founder", founderPaths);
  app.use("/investor", investorPaths);
  app.use("*", (req, res) => {
    res.status(404);
  });
};

export default constructorMethod;
