import * as express from "express";
import { PostService } from "./post.service";
import sanitizeHtml from "sanitize-html";

const sanitizeOption: sanitizeHtml.IOptions | undefined = {
  allowedTags: [
    "h1",
    "h2",
    "b",
    "i",
    "u",
    "s",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "taget"],
    img: ["src"],
    li: ["class"],
  },
  allowedSchemes: ["data", "http"],
};

class PostController {
  static async createPost(req: express.Request, res: express.Response) {
    try {
      const { title, body, tags } = req.body;
      const userId = req.session.user?.id;

      const createPostStatus = await PostService.createPost({
        title,
        body: sanitizeHtml(body, sanitizeOption),
        tags,
        userId,
      });

      if (!createPostStatus.ok) {
        res.status(400).json({
          error: "Post 생성 실패",
        });
      } else {
        res.status(201).json({
          data: createPostStatus.data,
        });
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }

  static async deletePost(req: express.Request, res: express.Response) {
    try {
      const { postId } = req.body;

      const deletePostStatus = await PostService.deletePost(postId);

      if (!deletePostStatus.ok) {
        res.status(400).json({
          error: "Post 삭제 실패",
        });
      } else {
        res.status(201).json({
          error: "Post 삭제 성공",
        });
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }

  static async readPost(req: express.Request, res: express.Response) {
    try {
      const { postId } = req.params;

      const readPostStatus = await PostService.readPost(Number(postId));

      if (!readPostStatus.ok) {
        res.status(404).json({ error: "Post 읽기 실패" });
      } else {
        res.status(201).json({
          data: readPostStatus.data,
        });
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }

  static async updatePost(req: express.Request, res: express.Response) {
    try {
      const postId = parseInt(req.params.postId, 10);
      const { title, body, tags } = req.body;

      let filteredBody = body;
      if (body) {
        filteredBody = sanitizeHtml(body, sanitizeOption);
      }
      const updatePostStatus = await PostService.updatePost({
        postId,
        title,
        body: filteredBody,
        tags,
      });

      if (!updatePostStatus.ok) {
        res.status(400).json({
          error: "Post 업데이트 실패",
        });
      } else {
        res.status(201).json({
          data: updatePostStatus.data,
        });
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }

  static async readPostList(req: express.Request, res: express.Response) {
    const removeHtmlAndShorten = (body: string) => {
      const filteredBody = sanitizeHtml(body, { allowedTags: [] });
      const limitLength = 130;
      return filteredBody.length < limitLength
        ? filteredBody
        : `${filteredBody.slice(0, limitLength)}...`;
    };
    try {
      const takeNumber = 12;
      const page = parseInt(req.query.page as string, 10) || 1;
      if (page < 1) {
        return res.status(400).json({
          error: "Bad Request",
        });
      }
      const postList = await PostService.readPostList(takeNumber, page);
      const totalPostCount = await PostService.totalPostCount();
      if (postList.length === 0) {
        return res.status(404).json({
          error: "게시글이 존재하지 않습니다.",
        });
      } else {
        const postListData = postList.map((post) => ({
          ...post,
          body: removeHtmlAndShorten(post.body),
        }));

        res.header(
          "last-page",
          Math.ceil(totalPostCount / takeNumber).toString()
        );
        return res.status(201).json({
          data: postListData,
        });
      }
    } catch (e) {
      res.status(500).json({
        error: e,
      });
    }
  }
}
export { PostController };
