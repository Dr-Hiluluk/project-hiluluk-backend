import { Tag } from "@prisma/client";
import client from "../../client";

interface postType {
  title: string;
  body: string;
  tags?: Tag[];
  userId?: number;
  postId?: number;
  thumbnail?: string;
  categoryId?: number;
  is_temp?: boolean;
}
class PostService {
  static async createPost({
    title,
    body,
    tags,
    userId,
    thumbnail,
    categoryId,
    is_temp,
  }: postType) {
    // title, body, UserId 유효성검사 && title 빈문자열 검사
    if (!(title && body && userId) || /^\s/.test(title)) {
      return {
        ok: false,
      };
    }

    let newPost: any;
    try {
      newPost = await client.post.create({
        data: {
          title,
          body,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            connect: {
              id: userId,
            },
          },
          ...(thumbnail && { thumbnail: thumbnail }),
          categoryId,
          is_temp: is_temp,
        },
      });
    } catch (e: any) {
      console.error(e);
    }

    const tagsArr: Tag[] = [];
    if (tags?.length) {
      tags.forEach(async (tag) => {
        const isExist = await client.tag.findFirst({
          where: {
            content: tag.content,
          },
        });
        // 기존에 존재하는 tag일 경우
        if (isExist) {
          try {
            await client.tag.update({
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
            console.error(e);
          }
        } else {
          // 기존에 존재하지 않는 tag일 경우
          try {
            const newTag = await client.tag.create({
              data: {
                createdAt: new Date(),
                content: tag.content,
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
            console.error(e);
          }
        }
      });
      //생성된 tag를 post에 업데이트
      tagsArr.forEach(async (tag) => {
        try {
          await client.post.update({
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
          console.error(e);
        }
      });
    }

    const createdPost = await client.post.findFirst({
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
        tags: {
          orderBy: {
            content: "asc",
          },
        },
      },
    });

    return {
      ok: true,
      data: createdPost,
    };
  }

  static async readPost(postId: number) {
    const searchPost = await client.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        tags: {
          select: {
            content: true,
          },
          orderBy: {
            content: "asc",
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
          },
        },
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
  static async readPostList(
    takeNumber: number,
    page: number,
    nickname: string
  ) {
    // 페이지 방식으로 구현
    // take: 받을 게시글 수, skip: 지나칠 게시글 수(페이지 변동으로 인해)
    try {
      const posts = await client.post.findMany({
        ...(nickname && {
          where: {
            user: {
              nickname: nickname,
            },
          },
        }),
        where: {
          NOT: {
            is_temp: {
              equals: true,
            },
          },
        },
        include: {
          tags: {
            select: {
              content: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              description: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: takeNumber,
        skip: (page - 1) * takeNumber,
      });
      return {
        ok: true,
        data: posts,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async searchPostList({
    word,
    page,
    takeNumber,
  }: {
    word: string;
    page: number;
    takeNumber: number;
  }) {
    try {
      const posts = await client.post.findMany({
        where: {
          OR: [
            {
              title: {
                startsWith: word,
              },
            },
            {
              body: {
                startsWith: word,
              },
            },
            {
              tags: {
                some: {
                  content: {
                    contains: word,
                  },
                },
              },
            },
          ],
          NOT: {
            is_temp: {
              equals: true,
            },
          },
        },
        include: {
          tags: {
            select: {
              content: true,
            },
          },
          user: {
            select: {
              id: true,
              nickname: true,
              description: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: takeNumber,
        skip: (page - 1) * takeNumber,
      });

      const totalPostCount = await client.post.count({
        where: {
          OR: [
            {
              title: {
                startsWith: word,
              },
            },
            {
              body: {
                startsWith: word,
              },
            },
            {
              tags: {
                some: {
                  content: {
                    startsWith: word,
                  },
                },
              },
            },
          ],
        },
      });
      return {
        ok: true,
        data: posts,
        totalPostCount: totalPostCount,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async searchPostListByTag({
    tag,
    page,
    takeNumber,
  }: {
    tag: string;
    page: number;
    takeNumber: number;
  }) {
    try {
      const posts = await client.post.findMany({
        where: {
          tags: {
            some: {
              content: {
                equals: tag,
              },
            },
          },
          NOT: {
            is_temp: {
              equals: true,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              description: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: takeNumber,
        skip: (page - 1) * takeNumber,
      });

      const totalPostCount = await client.post.count({
        where: {
          tags: {
            some: {
              content: {
                equals: tag,
              },
            },
          },
        },
      });

      return {
        ok: true,
        data: posts,
        totalPostCount,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async updatePost({
    categoryId,
    postId,
    title,
    body,
    tags,
    thumbnail,
    is_temp,
  }: postType) {
    // 업데이트할 post의 id 찾기
    const searchPost = await client.post.findUnique({
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
      await client.post.update({
        where: {
          id: postId,
        },
        data: {
          ...(categoryId && { categoryId }),
          ...(title && { title: title }),
          ...(body && { body: body }),
          ...(thumbnail && { thumbnail: thumbnail }),
          is_temp: is_temp,
          updatedAt: new Date(),
        },
      });
    } catch (e: any) {
      return {
        ok: false,
        error: e,
      };
    }
    // 기존태그 삭제
    if (searchPost) {
      searchPost.tags.forEach(async (tag) => {
        if (tag.count === 1) {
          try {
            await client.tag.delete({
              where: {
                id: tag.id,
              },
            });
          } catch (e) {
            return {
              ok: false,
              error: e,
            };
          }
        } else {
          try {
            await client.tag.update({
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
            return {
              ok: false,
              error: e,
            };
          }
        }
      });
    }
    // 새로운태그 생성
    if (tags) {
      tags.forEach(async (tag) => {
        try {
          await client.tag.create({
            data: {
              createdAt: new Date(),
              content: tag.content,
              count: 1,
              posts: {
                connect: {
                  id: searchPost.id,
                },
              },
            },
          });
        } catch (e: any) {
          return {
            ok: false,
            error: e,
          };
        }
      });
    }

    const updatedPost = await client.post.findFirst({
      where: {
        id: searchPost.id,
      },
      include: {
        user: true,
        tags: {
          orderBy: {
            content: "asc",
          },
        },
      },
    });
    return {
      ok: true,
      data: updatedPost,
    };
  }

  static async deletePost(postId: number) {
    // 삭제 할 post의 id 찾기
    const searchPost = await client.post.findUnique({
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
        error: "postId가 존재하지 않습니다.",
      };
    }
    // 삭제 할 post에 연결된 tag 삭제
    searchPost.tags.forEach(async (tag) => {
      if (tag.count === 1) {
        try {
          await client.tag.delete({
            where: {
              id: tag.id,
            },
          });
        } catch (e: any) {
          return {
            ok: false,
            error: e,
          };
        }
      } else {
        try {
          await client.tag.update({
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
          return {
            ok: false,
            error: e,
          };
        }
      }
    });

    // post 삭제
    try {
      await client.post.delete({
        where: {
          id: searchPost.id,
        },
      });
    } catch (e: any) {
      return {
        ok: false,
        error: e,
      };
    }

    return {
      ok: true,
    };
  }

  static async totalPostCount() {
    return client.post.count();
  }
}

export { PostService };
