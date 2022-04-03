import express, { Router } from "express";
import { createUser } from "./user.service";

const userRouter: Router = express.Router();

userRouter.post("/users", async (req, res) => {
  const user = req.body;
  const createdUser = await createUser(user);
  res.json(createdUser);
});

export default userRouter;
