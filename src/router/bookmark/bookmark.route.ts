import express, { Router } from "express";
import { AuthController } from "../auth/auth.ctrl";
import BookmarkController from "./bookmark.ctrl";

const bookmarkRouter: Router = express.Router();

bookmarkRouter.get(
  "/",
  AuthController.authCheck,
  BookmarkController.getBookmarks
);

bookmarkRouter.post(
  "/",
  AuthController.authCheck,
  BookmarkController.createBookmark
);

bookmarkRouter.delete(
  "/",
  AuthController.authCheck,
  BookmarkController.deleteBookmark
);

export default bookmarkRouter;
