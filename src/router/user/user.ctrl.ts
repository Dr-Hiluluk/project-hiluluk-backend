import express from "express";
import { removeHtmlAndShorten, shortenTitle } from "../shared";
import UserService from "./user.service";

class UserController {
  static async getUserProfileByNickname(
    req: express.Request,
    res: express.Response
  ) {
    const { nickname } = req.params;
    try {
      const result = await UserService.getUserProfileByNickname(nickname);
      if (!result.ok) {
        return res.status(404).json({ error: result.error });
      }

      result.data?.posts.forEach((post) => {
        post.title = shortenTitle(post.title);
        post.body = removeHtmlAndShorten(post.body);
      });

      return res.status(200).send(result.data);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  }

  static async updateUserProfile(req: express.Request, res: express.Response) {
    const userId = Number(req.query.userId);
    const description = req.query.description as string;
    const thumbnail = req.query.thumbnail as string;
    const password = req.query.password as string;

    try {
      const result = await UserService.updateUserProfile({
        id: userId,
        description,
        thumbnail,
        password,
      });
      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).send(result.data);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  }

  static async deleteUser(req: express.Request, res: express.Response) {
    const { userId } = req.params;
    try {
      const result = await UserService.deleteUser({ id: Number(userId) });
      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      req.session.destroy(() => {});
      res.clearCookie("connect.sid");
      return res.status(200).end();
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  }
}

export default UserController;
