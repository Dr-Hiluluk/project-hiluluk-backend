import { PrismaClient, Tag } from "@prisma/client";

interface postType {
  title: string;
  body: string;
  tags?: Tag[];
  userId?: number;
  postId?: number;
}

const prisma = new PrismaClient();

class PostService {
  static async createPost({ title, body, tags, userId }: postType) {
    // title, body, UserId 유효성검사 && title 빈문자열 검사
    if (!(title && body && userId) || /^\s/.test(title)) {
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
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (e: any) {
      console.error(e);
    }

    const tagsArr: Tag[] = [];
    if (tags?.length) {
      tags.forEach(async (tag) => {
        const isExist = await prisma.tag.findFirst({
          where: {
            content: tag.content,
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
            console.error(e);
          }
        } else {
          // 기존에 존재하지 않는 tag일 경우
          try {
            const newTag = await prisma.tag.create({
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
          console.error(e);
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
      if (tag.count === 1) {
        try {
          await prisma.tag.delete({
            where: {
              id: tag.id,
            },
          });
        } catch (e: any) {
          console.error(e);
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
          console.error(e);
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
      console.error(e);
    }

    return {
      ok: true,
    };
  }

  static async readPost(postId: number) {
    const searchPost = await prisma.post.findFirst({
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
      await prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          ...(title && { title: title }),
          ...(body && { body: body }),
          updatedAt: new Date(),
        },
      });
    } catch (e: any) {
      console.error(e);
    }
    // 기존태그 삭제
    if (searchPost) {
      searchPost.tags.forEach(async (tag) => {
        if (tag.count === 1) {
          try {
            await prisma.tag.delete({
              where: {
                id: tag.id,
              },
            });
          } catch (e) {
            console.error(e);
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
                    id: postId,
                  },
                },
              },
            });
          } catch (e: any) {
            console.error(e);
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
          console.error(e);
        }
      });
    }

    const updatedPost = await prisma.post.findFirst({
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

  static async readPostList(takeNumber: number, page: number) {
    // 페이지 방식으로 구현
    // take: 받을 게시글 수, skip: 지나칠 게시글 수(페이지 변동으로 인해)
    const posts = prisma.post.findMany({
      include: {
        tags: {
          select: {
            content: true,
          },
        },
        user: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: takeNumber,
      skip: (page - 1) * takeNumber,
    });
    return posts;
  }

  static async totalPostCount() {
    return prisma.post.count();
  }
}

export { PostService };
