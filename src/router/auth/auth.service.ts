import { User } from "@prisma/client";
import client from "../../client";
import { hash } from "../../utils/utils";

class AuthService {
  static async register({ email, password, name, nickname }: User) {
    try {
      const isExist = await client.user.findMany({
        where: {
          OR: [
            {
              email,
            },
            {
              nickname,
            },
          ],
        },
      });
      if (isExist.length) {
        return {
          ok: false,
          status: 409,
        };
      }
      const newUser = await client.user.create({
        data: {
          email,
          password: hash(password),
          name,
          nickname,
          description: `안녕하세요. ${nickname}입니다.`,
        },
      });

      return {
        ok: true,
        data: newUser,
      };
    } catch (e: any) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async login({ email, password }: User) {
    const validateUser = this.validatePassword(email, password);
    return validateUser;
  }

  static async logout(id?: User["id"]) {
    try {
      const user = await client.user.findUnique({
        where: {
          id,
        },
      });
      return {
        ok: true,
        data: user,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async searchUser(nickname: User["nickname"]) {
    try {
      const user = await client.user.findFirst({
        where: {
          nickname,
        },
      });
      return {
        ok: true,
        data: user,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async validatePassword(email: string, password: string) {
    try {
      const user = await client.user.findUnique({
        where: {
          email,
        },
      });
      return user?.password === hash(password) ? user : null;
    } catch (e: any) {
      console.error(`ValidatePasswrod Error:${e.message}`);
    }
  }
}

export { AuthService };
