import { PrismaClient, Tag } from "@prisma/client";
import { currentTime } from "../../utils/utils";

interface postType {
  title: string;
  body: string;
  tags?: string[];
  userId?: number;
  postId?: number;
}

const prisma = new PrismaClient();

class PostService {
  static async createPost({ title, body, tags, userId }: postType) {
    // title, body, UserId 유효성검사 && title 빈문자열 검사
    if (!(title && body && userId) || /\s/.test(title)) {
      return {
        ok: false,
      };
    }

    let newPost: any;
    try {
      newPost = await prisma.post.create({
        data: {
          title,
          body,
          createdAt: currentTime(),
          updatedAt: currentTime(),
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }

    const tagsArr: Tag[] = [];
    if (tags?.length) {
      tags.forEach(async (tag) => {
        const isExist = await prisma.tag.findFirst({
          where: {
            content: tag,
          },
        });
        // 기존에 존재하는 tag일 경우
        if (isExist) {
          try {
            await prisma.tag.update({
              where: {
                id: isExist.id,
              },
              data: {
                count: {
                  increment: 1,
                },
                posts: {
                  connect: {
                    id: newPost.id,
                  },
                },
              },
            });
            tagsArr.push(isExist);
          } catch (e: any) {
            throw new Error(e);
          }
        } else {
          // 기존에 존재하지 않는 tag일 경우
          try {
            const newTag = await prisma.tag.create({
              data: {
                createdAt: currentTime(),
                content: tag,
                count: 1,
                posts: {
                  connect: {
                    id: newPost.id,
                  },
                },
              },
            });
            tagsArr.push(newTag);
          } catch (e: any) {
            throw new Error(e);
          }
        }
      });
      //생성된 tag를 post에 업데이트
      tagsArr.forEach(async (tag) => {
        try {
          await prisma.post.update({
            where: {
              id: newPost.id,
            },
            data: {
              tags: {
                connect: {
                  id: tag.id,
                },
              },
            },
          });
        } catch (e: any) {
          throw new Error(e);
        }
      });
    }

    const createdPost = await prisma.post.findFirst({
      where: {
        id: newPost.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nickname: true,
          },
        },
        tags: true,
      },
    });

    return {
      ok: true,
      data: createdPost,
    };
  }

  static async deletePost(postId: number) {
    // 삭제 할 post의 id 찾기
    const searchPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        tags: true,
      },
    });
    // postId 찾기 실패 시 false
    if (!searchPost) {
      return {
        ok: false,
      };
    }
    // 삭제 할 post에 연결된 tag 삭제
    searchPost.tags.forEach(async (tag) => {
      if (tag.count === 1n) {
        try {
          await prisma.tag.delete({
            where: {
              id: tag.id,
            },
          });
        } catch (e: any) {
          throw new Error(e);
        }
      } else {
        try {
          await prisma.tag.update({
            where: {
              id: tag.id,
            },
            data: {
              count: {
                decrement: 1,
              },
              posts: {
                disconnect: {
                  id: searchPost.id,
                },
              },
            },
          });
        } catch (e: any) {
          throw new Error(e);
        }
      }
    });

    // post 삭제
    try {
      await prisma.post.delete({
        where: {
          id: searchPost.id,
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }

    return {
      ok: true,
    };
  }

  static async readPost(postId: number) {
    const searchPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!searchPost) {
      return {
        ok: false,
      };
    } else {
      return {
        ok: true,
        data: searchPost,
      };
    }
  }

  static async updatePost({ postId, title, body, tags }: postType) {
    // 업데이트할 post의 id 찾기
    const searchPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user: true,
        tags: true,
      },
    });
    if (!searchPost) {
      return {
        ok: false,
      };
    }
    // post 업데이트
    try {
      prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          title,
          body,
          updatedAt: currentTime(),
        },
      });
    } catch (e: any) {
      throw new Error(e);
    }
    // 기존태그 삭제
    if (searchPost) {
      searchPost.tags.forEach(async (tag) => {
        if (tag.count === 1n) {
          await prisma.tag.delete({
            where: {
              id: tag.id,
            },
          });
        } else {
          try {
            await prisma.tag.update({
              where: {
                id: tag.id,
              },
              data: {
                count: {
                  decrement: 1,
                },
                posts: {
                  disconnect: {
                    id: postId,
                  },
                },
              },
            });
          } catch (e: any) {
            throw new Error(e);
          }
        }
      });
    }
    // 새로운태그 생성
    if (tags) {
      tags.forEach(async (tag) => {
        try {
          await prisma.tag.create({
            data: {
              createdAt: currentTime(),
              content: tag,
              count: 1,
              posts: {
                connect: {
                  id: searchPost.id,
                },
              },
            },
          });
        } catch (e: any) {
          throw new Error(e);
        }
      });
    }

    const updatedPost = await prisma.post.findFirst({
      where: {
        id: searchPost.id,
      },
      include: {
        user: true,
        tags: true,
      },
    });
    return {
      ok: true,
      data: updatedPost,
    };
  }
}

export { PostService };
