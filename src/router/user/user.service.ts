import client from "../../client";
import { hash } from "../../utils/utils";
import { PostService } from "../post/post.service";

class UserService {
  static async getUserProfileByNickname(nickname: string) {
    try {
      const user = await client.user.findFirst({
        where: {
          nickname: {
            equals: nickname,
          },
        },
        select: {
          id: true,
          description: true,
          email: true,
          memos: true,
          thumbnail: true,
          name: true,
          nickname: true,
          posts: {
            orderBy: {
              id: "desc",
            },
            include: {
              user: true,
            },
          },
        },
      });
      return {
        ok: true,
        data: user,
      };
    } catch (e: any) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async updateUserProfile({
    id,
    description,
    thumbnail,
    password,
  }: {
    id: number;
    description?: string;
    thumbnail?: string;
    password?: string;
  }) {
    try {
      const user = await client.user.update({
        where: {
          id,
        },
        data: {
          ...(description && { description }),
          ...(thumbnail && { thumbnail }),
          ...(password && { password: hash(password) }),
        },
      });
      return {
        ok: true,
        data: user,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async deleteUser({ id }: { id: number }) {
    try {
      // // 부모 댓글인 경우, 내용만 삭제
      // await client.comment.updateMany({
      //   where: {
      //     AND: [
      //       {
      //         userId: id,
      //       },
      //       {
      //         parentId: {
      //           equals: null,
      //         },
      //       },
      //     ],
      //   },
      //   data: {
      //     isDeleted: true,
      //     content: "삭제된 댓글입니다.",
      //   },
      // });

      // // 대댓글인 경우, 삭제
      // await client.comment.deleteMany({
      //   where: {
      //     AND: [
      //       {
      //         userId: id,
      //       },
      //       {
      //         parentId: {
      //           not: null,
      //         },
      //       },
      //     ],
      //   },
      // });

      const posts = await client.post.findMany({
        where: {
          userId: id,
        },
        select: {
          id: true,
        },
      });

      await client.comment.updateMany({
        where: {
          userId: id,
        },
        data: {
          isDeleted: true,
          content: "삭제된 댓글입니다.",
        },
      });

      posts.forEach(
        async (post) =>
          await client.comment.deleteMany({ where: { postId: post.id } })
      );

      const user = await client.user.delete({
        where: {
          id,
        },
        include: {
          posts: {
            select: {
              id: true,
            },
          },
        },
      });

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }
}

export default UserService;
