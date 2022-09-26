import express, { Router } from "express";
import authRouter from "./auth/auth.route";
import bookmarkRouter from "./bookmark/bookmark.route";
import commentRouter from "./comment/comment.route";
import fileRouter from "./file/file.route";
import memoRouter from "./Memo/memo.route";
import postRouter from "./post/post.route";
import userRouter from "./user/user.route";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/post", postRouter);
router.use("/comment", commentRouter);
router.use("/file", fileRouter);
router.use("/memo", memoRouter);
router.use("/user", userRouter);
router.use("/bookmark", bookmarkRouter);

export default router;
