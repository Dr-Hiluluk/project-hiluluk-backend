import express, { Router } from "express";
import userRouter from "./auth/auth.route";
import commentRouter from "./comment/comment.route";
import postRouter from "./post/post.route";

const router: Router = express.Router();

router.use("/auth", userRouter);
router.use("/post", postRouter);
router.use("/comment", commentRouter);
export default router;
