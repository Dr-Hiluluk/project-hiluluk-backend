import { PrismaClient, User } from "@prisma/client";
import { hash } from "../../utils/utils";

const prisma = new PrismaClient();

class AuthService {
  static async register({ email, password, name, nickname }: User) {
    try {
      const isExist = await prisma.user.findMany({
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
        return 409;
      }
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hash(password),
          name,
          nickname,
        },
      });
      return newUser;
      // if (!newUser) {
      //   throw httpError.
      // }
    } catch (e: any) {
      throw new Error(e);
    }
  }

  static async login({ email, password }: User) {
    const validateUser = this.validatePassword(email, password);
    return validateUser;
  }

  static async logout(id?: User["id"]) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  static async searchUser(nickname: User["nickname"]) {
    return await prisma.user.findFirst({
      where: {
        nickname,
      },
    });
  }

  static async validatePassword(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
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
