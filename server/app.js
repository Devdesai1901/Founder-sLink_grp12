import express from "express";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
dotenv.config();
const app = express();
connectDB();

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};
app.use("/client/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
configRoutes(app);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("We've now got a server!");
  console.log(`Server running on port ${PORT}`);
});
