import express from "express";
import { AuthController } from "../auth/auth.ctrl";
import UserController from "./user.ctrl";

const userRouter: express.Router = express.Router();

userRouter.get("/:nickname", UserController.getUserProfileByNickname);
userRouter.patch(
  "/",
  AuthController.authCheck,
  UserController.updateUserProfile
);
userRouter.delete(
  "/:userId",
  AuthController.authCheck,
  UserController.deleteUser
);

export default userRouter;
