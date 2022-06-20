import client from "../../client";
import { hash } from "../../utils/utils";

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
      const user = await client.user.delete({
        where: {
          id,
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
