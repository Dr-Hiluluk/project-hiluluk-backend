import express, { Router } from "express";
import { PostController } from "./post.ctrl";

const postRouter: Router = express.Router();

postRouter.post("/", PostController.createPost);
postRouter.delete("/", PostController.deletePost);
postRouter.get("/", PostController.readPost);
postRouter.patch("/", PostController.updatePost);

export default postRouter;
