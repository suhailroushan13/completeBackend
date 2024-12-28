import express from "express";
import config from "config";
import publicRouter from "./controllers/public/index.js"
import authMiddleware from "./middleware/auth.js";
import userRouter from "./controllers/users/index.js"

import "./utils/dbConnect.js"

const PORT = config.get("PORT");

const app = express();


/// if you miss this.. req.body will not work
app.use(express.json()); // to accept data from user in post , put , delete apis

app.get("/", (req, res) => {
  try {
    res.status(200).json({ msg: "Server is Up and Running" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});

app.use("/api/public",publicRouter);

app.use(authMiddleware);

app.use("/api/private/user",userRouter);

app.listen(PORT, () => {
  console.log(`Server is Up and Running ${PORT}`);
});
