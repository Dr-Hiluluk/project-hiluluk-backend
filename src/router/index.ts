import express, { Router } from "express";
import userRouter from "./auth/auth.route";

const router: Router = express.Router();

router.use("/auth", userRouter);

export default router;
