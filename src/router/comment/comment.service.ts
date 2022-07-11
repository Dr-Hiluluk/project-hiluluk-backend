import client from "../../client";

interface CommentType {
  postId: number;
  userId: number;
  parentId: number | null | undefined;
  content: string;
}

class CommentService {
  static async createComment({
    postId,
    userId,
    parentId,
    content,
  }: CommentType) {
    try {
      let parent = null;
      if (parentId) {
        try {
          parent = await client.comment.findFirst({
            where: {
              id: parentId,
            },
            select: {
              path: true,
            },
          });
        } catch (e) {
          console.error(e);
          return {
            ok: false,
          };
        }
      }

      const newComment = await client.comment.create({
        data: {
          content,
          postId,
          userId,
          ...(parentId && { parentId: parentId }),
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(parent && parentId && { path: parent.path }),
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              thumbnail: true,
            },
          },
          children: {
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
      });

      //  path에 댓글 id 추가
      await client.comment.update({
        where: {
          id: newComment.id,
        },
        data: {
          path: [...newComment.path, newComment.id],
        },
      });

      if (newComment.path[0]) {
        try {
          await client.comment.update({
            where: {
              id: newComment.path[0],
            },
            data: {
              count: {
                increment: 1,
              },
            },
          });
        } catch (e) {
          console.error(e);
          return {
            ok: false,
          };
        }
      }

      try {
        await client.post.update({
          where: {
            id: postId,
          },
          data: {
            comments_count: {
              increment: 1,
            },
          },
        });
      } catch (e) {
        console.error(e);
        return {
          ok: false,
        };
      }

      return {
        ok: true,
        data: newComment,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async readCommentList(postId: number) {
    try {
      const comments = await client.comment.findMany({
        where: {
          postId,
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          path: "asc",
        },
      });

      return {
        ok: true,
        data: comments,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async readChildCommentList(commentId: number) {
    try {
      // const comments =
      //   await client.$queryRaw`select * FROM "Comment" where "parentId" is not null order by path,"createdAt"`;
      const comments = await client.comment.findMany({
        where: {
          path: {
            has: commentId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return {
        ok: true,
        data: comments,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async updateComment(commentId: number, content: string) {
    try {
      const comment = await client.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content: content,
          updatedAt: new Date(),
        },
      });
      return {
        ok: true,
        data: comment,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async deleteComment(commentId: number) {
    try {
      const comment = await client.comment.findFirst({
        where: {
          id: commentId,
        },
        include: {
          children: true,
        },
      });
      // 대댓글 or 부모댓글인데 자식이 없는경우 =>  바로 삭제
      let deletedComment;
      if (comment?.parentId || comment?.children.length === 0) {
        try {
          deletedComment = await client.comment.delete({
            where: {
              id: commentId,
            },
            include: {
              user: {
                select: {
                  id: true,
                  nickname: true,
                  thumbnail: true,
                },
              },
              children: {
                include: {
                  user: {
                    select: {
                      id: true,
                      nickname: true,
                      thumbnail: true,
                    },
                  },
                },
              },
            },
          });

          // 삭제시 부모댓글 count 컬럼 갯수 조정
          if (comment?.parentId) {
            await client.comment.update({
              where: {
                id: comment.path[0],
              },
              data: {
                count: {
                  decrement: 1,
                },
              },
            });
          }
        } catch (e) {
          console.error(e);
          return {
            ok: false,
          };
        }
      } else {
        // 부모댓글인데 자식있는경우 => 삭제된 댓글입니다.
        deletedComment = await client.comment.update({
          where: {
            id: commentId,
          },
          data: {
            isDeleted: true,
            content: "삭제된 댓글입니다.",
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                thumbnail: true,
              },
            },
            children: {
              include: {
                user: {
                  select: {
                    id: true,
                    nickname: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        });
      }
      // 해당 post의 comment_count 컬럼 갯수 조정
      try {
        await client.post.update({
          where: {
            ...(comment?.postId && { id: comment?.postId }),
          },
          data: {
            comments_count: {
              decrement: 1,
            },
          },
        });
      } catch (e) {
        console.error(e);
        return {
          ok: false,
        };
      }

      return {
        ok: true,
        data: deletedComment,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }
}

export default CommentService;
