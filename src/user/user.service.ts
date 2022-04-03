import { PrismaClient, User } from "@prisma/client";
import crypto from "crypto";
import { hash } from "../utils/utils";

const prisma = new PrismaClient();

export const createUser = async ({ email, password, name, nickname }: User) => {
  const newUser = await prisma.user.create({
    data: {
      email,
      password,
      name,
      nickname,
    },
  });
  console.log("Created New User: ", newUser);
};

export const searchUser = async (nickname: User["nickname"]) => {
  return await prisma.user.findFirst({
    where: {
      nickname,
    },
  });
};

export const validatePassword = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user?.password === hash(password);
};
