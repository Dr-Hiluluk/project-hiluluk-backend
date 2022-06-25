import client from "../client";
import sanitizeHtml from "sanitize-html";

export const sanitizeOption: sanitizeHtml.IOptions | undefined = {
  allowedTags: [
    "h1",
    "h2",
    "b",
    "i",
    "u",
    "s",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "taget"],
    img: ["src"],
    li: ["class"],
  },
  allowedSchemes: ["data", "http"],
};

export const loggedInUser = (id: number) => {
  return client.user.findFirst({ where: { id } });
};

export const removeHtmlAndShorten = (body: string) => {
  const filteredBody = sanitizeHtml(body, { allowedTags: [] });
  const limitLength = 130;
  return filteredBody.length < limitLength
    ? filteredBody
    : `${filteredBody.slice(0, limitLength)}...`;
};

export const shortenTitle = (title: string) => {
  const limitLength = 10;
  return title.length > limitLength
    ? `${title.slice(0, limitLength)}...`
    : title;
};
