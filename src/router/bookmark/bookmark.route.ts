import express, { Router } from "express";
import BookmarkController from "./bookmark.ctrl";

const bookmarkRouter: Router = express.Router();

bookmarkRouter.get("/", BookmarkController.getBookmarks);

bookmarkRouter.post("/", BookmarkController.createBookmark);

bookmarkRouter.delete("/", BookmarkController.deleteBookmark);

export default bookmarkRouter;
