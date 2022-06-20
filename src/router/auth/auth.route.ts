import express, { Router } from "express";
import { AuthController } from "./auth.ctrl";

const authRouter: Router = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.get("/check", AuthController.loginCheck);
authRouter.post("/logout", AuthController.logout);
export default authRouter;
