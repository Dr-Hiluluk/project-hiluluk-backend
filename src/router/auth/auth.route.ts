import express, { Router } from "express";
import { AuthController } from "./auth.ctrl";

const userRouter: Router = express.Router();

userRouter.post("/register", AuthController.register);
userRouter.post("/login", AuthController.login);
userRouter.get("/check", AuthController.loginCheck);
export default userRouter;
