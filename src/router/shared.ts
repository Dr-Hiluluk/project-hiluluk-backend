import client from "../client";

export const loggedInUser = (id: number) => {
  return client.user.findFirst({ where: { id } });
};
