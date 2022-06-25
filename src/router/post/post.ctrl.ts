import * as express from "express";
import { PostService } from "./post.service";
import { removeHtmlAndShorten, shortenTitle } from "../shared";
class PostController {
  static async createPost(req: express.Request, res: express.Response) {
    try {
      const { title, body, tags, thumbnail, categoryId } = req.body;
      const userId = req.session.user?.id;

      const createPostStatus = await PostService.createPost({
        title,
        body,
        tags,
        userId,
        thumbnail,
        categoryId,
      });

      if (!createPostStatus.ok) {
        return res.status(400).json({
          error: "Post 생성 실패",
        });
      }
      return res.status(201).send(createPostStatus.data);
    } catch (e: any) {
      return res.status(500).json({
        error: e,
      });
    }
  }

  static async readPost(req: express.Request, res: express.Response) {
    try {
      const { postId } = req.params;
      const readPostStatus = await PostService.readPost(Number(postId));

      if (!readPostStatus.ok) {
        return res.status(404).json({ error: "Post 읽기 실패" });
      }
      return res.status(200).send(readPostStatus.data);
    } catch (e: any) {
      return res.status(500).json({
        error: e,
      });
    }
  }

  static async readPostList(req: express.Request, res: express.Response) {
    const takeNumber = 20;
    try {
      const nickname = req.query.nickname as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      if (page < 1) {
        return res.status(400).json({
          error: "Bad Request",
        });
      }
      const result = await PostService.readPostList(takeNumber, page, nickname);
      const totalPostCount = await PostService.totalPostCount();
      if (!result.ok) {
        return res.status(404).json({
          error: result.error || "게시글이 존재하지 않습니다.",
        });
      }

      const postListData = result.data?.map((post) => ({
        ...post,
        title: shortenTitle(post.title),
        body: removeHtmlAndShorten(post.body),
      }));

      res.header(
        "last-page",
        Math.ceil(totalPostCount / takeNumber).toString()
      );
      return res.status(200).json(postListData);
    } catch (e) {
      return res.status(500).json({
        error: e,
      });
    }
  }

  static async searchPostList(req: express.Request, res: express.Response) {
    const takeNumber = 20;
    try {
      const word = req.query.word as string;
      const page = Number(req.query.page) || 1;
      const result = await PostService.searchPostList({
        word,
        page,
        takeNumber,
      });
      if (!result.ok) {
        return res.status(404).json({ error: result.error });
      }
      const postListData = result.data
        ?.map((post) => ({
          ...post,
          title: shortenTitle(post.title),
          body: removeHtmlAndShorten(post.body),
        }))
        .sort((a, b) => b.id - a.id);
      res.header(
        "last-page",
        Math.ceil((result.totalPostCount || 0) / takeNumber).toString()
      );
      res.header("total-post-count", (result.totalPostCount || 0).toString());
      return res.status(200).json(postListData);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async updatePost(req: express.Request, res: express.Response) {
    try {
      const postId = parseInt(req.params.postId, 10);
      const { title, body, tags, thumbnail } = req.body;

      const updatePostStatus = await PostService.updatePost({
        postId,
        title,
        body,
        tags,
        thumbnail,
      });

      if (!updatePostStatus.ok) {
        return res.status(400).json({
          error: "Post 업데이트 실패",
        });
      }
      return res.status(201).json(updatePostStatus.data);
    } catch (e: any) {
      return res.status(500).json({
        error: e,
      });
    }
  }

  static async deletePost(req: express.Request, res: express.Response) {
    try {
      const postId = req.params.postId ? parseInt(req.params.postId, 10) : null;
      if (!postId) {
        throw new Error("postId가 존재하지 않습니다.");
      }
      const deletePostStatus = await PostService.deletePost(postId);

      if (!deletePostStatus.ok) {
        res.status(400).json({
          error: "Post 삭제 실패",
        });
      } else {
        res.status(200).json("Post 삭제 성공");
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }
}
export { PostController };
