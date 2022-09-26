import * as express from "express";
import BookmarkService from "./bookmark.service";

class BookmarkController {
  static async createBookmark(req: express.Request, res: express.Response) {
    const { postId } = req.body;
    const userId = req.session.user?.id!;
    try {
      const result = await BookmarkService.createBookmark({ userId, postId });
      if (result.ok) {
        return res.status(200).send(result.data);
      }
      return res.status(400).send(result.error);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async getBookmarks(req: express.Request, res: express.Response) {
    const { userId } = req.query;
    try {
      const result = await BookmarkService.getBookmarks(Number(userId));
      if (result.ok) {
        return res.status(200).send(result.data);
      }
      return res.status(400).send(result.error);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async deleteBookmark(req: express.Request, res: express.Response) {
    const { postId } = req.query;
    const userId = req.session.user?.id!;
    try {
      const result = await BookmarkService.deleteBookmark({
        userId,
        postId: Number(postId),
      });
      if (result.ok) {
        return res.sendStatus(204).end();
      }
      return res.status(400).send(result.error);
    } catch (e) {
      return res.status(500).send(e);
    }
  }
}

export default BookmarkController;
