import * as express from "express";
import { PostService } from "./post.service";

class PostController {
  static async createPost(req: express.Request, res: express.Response) {
    try {
      const { title, body, tags } = req.body;
      const userId = req.session.user?.id;

      const createPostStatus = await PostService.createPost({
        title,
        body,
        tags,
        userId,
      });
      if (!createPostStatus.ok) {
        res.status(400).json({
          status: 400,
          message: "Post 생성 실패",
        });
      } else {
        res.status(201).json({
          status: 201,
          data: createPostStatus.data,
        });
      }
    } catch (e: any) {
      throw new Error("500", e);
    }
  }

  static async deletePost(req: express.Request, res: express.Response) {
    try {
      const { postId } = req.body;

      const deletePostStatus = await PostService.deletePost(postId);

      if (!deletePostStatus.ok) {
        res.status(400).json({
          status: 400,
          message: "Post 삭제 실패",
        });
      } else {
        res.status(201).json({
          status: 201,
          message: "Post 삭제 성공",
        });
      }
    } catch (e: any) {
      throw new Error("500", e);
    }
  }

  static async readPost(req: express.Request, res: express.Response) {
    try {
      const { postId } = req.body;
      const readPostStatus = await PostService.readPost(postId);

      if (!readPostStatus.ok) {
        res.status(400).json({
          status: 400,
          message: "Post 읽기 실패",
        });
      } else {
        res.status(201).json({
          status: 201,
          data: readPostStatus.data,
        });
      }
    } catch (e: any) {
      throw new Error("500", e);
    }
  }

  static async updatePost(req: express.Request, res: express.Response) {
    try {
      const { postId, title, body, tags } = req.body;
      const updatePostStatus = await PostService.updatePost({
        postId,
        title,
        body,
        tags,
      });

      if (!updatePostStatus.ok) {
        res.status(400).json({
          status: 400,
          message: "Post 업데이트 실패",
        });
      } else {
        res.status(201).json({
          status: 201,
          data: updatePostStatus.data,
        });
      }
    } catch (e: any) {
      throw new Error("500", e);
    }
  }
}
export { PostController };
