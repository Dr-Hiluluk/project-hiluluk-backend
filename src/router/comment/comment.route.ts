import express, { Router } from "express";
import { AuthController } from "../auth/auth.ctrl";
import CommentController from "./comment.ctrl";

const commentRouter: Router = express.Router();

commentRouter.post(
  "/",
  AuthController.authCheck,
  CommentController.createComment
);
commentRouter.get("/", CommentController.readCommentList);
commentRouter.get("/:commentId", CommentController.readChildCommentList);
commentRouter.patch(
  "/",
  AuthController.authCheck,
  CommentController.updateComment
);
commentRouter.delete(
  "/:commentId",
  AuthController.authCheck,
  CommentController.deleteComment
);
export default commentRouter;
