import crypto from "crypto";

export const hash = (password) => {
  return crypto
    .createHmac("sha256", process.env.PRIVATE_KEY)
    .update(password)
    .digest("hex");
};

export const currentTime = () => {
  let time = new Date();
  time.setHours(time.getHours() + 9);
  return time;
};
