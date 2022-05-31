import * as express from "express";
import CommentService from "./comment.service";

class CommentController {
  static async createComment(req: express.Request, res: express.Response) {
    const { userId, postId, parentId, content } = req.body;
    try {
      const comment = await CommentService.createComment({
        postId,
        userId,
        parentId,
        content,
      });
      if (!comment.ok) {
        return res.status(400).json({
          error: "댓글이 생성되지 않았습니다.",
        });
      }
      return res.status(201).json(comment.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  }
  static async readCommentList(req: express.Request, res: express.Response) {
    const { postId } = req.query;
    try {
      const commentList = await CommentService.readCommentList(Number(postId));

      if (!commentList.ok) {
        return res.status(400).json({
          error: "댓글을 읽어오지 못했습니다.",
        });
      }
      return res.status(200).json(commentList.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  }

  static async readChildCommentList(
    req: express.Request,
    res: express.Response
  ) {
    const { commentId } = req.params;
    try {
      const childCommentList = await CommentService.readChildCommentList(
        Number(commentId)
      );
      if (!childCommentList.ok) {
        return res.status(400).json({
          error: "댓글을 읽어오지 못했습니다.",
        });
      }
      return res.status(200).json(childCommentList.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  }

  static async updateComment(req: express.Request, res: express.Response) {
    const { commentId, content } = req.body;
    try {
      const comment = await CommentService.updateComment(commentId, content);
      if (!comment.ok) {
        return res.status(400).json({
          error: "Comment 업데이트 실패",
        });
      }
      return res.status(201).json(comment.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  }

  static async deleteComment(req: express.Request, res: express.Response) {
    const { commentId } = req.params;
    try {
      const isDeleted = await CommentService.deleteComment(parseInt(commentId));
      if (!isDeleted.ok) {
        return res.status(400).json({
          error: "Comment 삭제 실패",
        });
      }
      return res.status(200).json(isDeleted.data);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: e,
      });
    }
  }
}

export default CommentController;
