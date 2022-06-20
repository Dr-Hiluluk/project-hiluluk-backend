import express from "express";
import UserController from "./user.ctrl";

const userRouter: express.Router = express.Router();

userRouter.get("/:nickname", UserController.getUserProfileByNickname);
userRouter.patch("/", UserController.updateUserProfile);
userRouter.delete("/:userId", UserController.deleteUser);

export default userRouter;
