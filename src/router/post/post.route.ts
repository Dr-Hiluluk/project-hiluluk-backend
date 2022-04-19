import express, { Router } from "express";
import { AuthController } from "../auth/auth.ctrl";
import { PostController } from "./post.ctrl";

const postRouter: Router = express.Router();

postRouter.post("/", AuthController.authCheck, PostController.createPost);
postRouter.delete("/", AuthController.authCheck, PostController.deletePost);
postRouter.get("/", PostController.readPost);
postRouter.patch("/", AuthController.authCheck, PostController.updatePost);

export default postRouter;
