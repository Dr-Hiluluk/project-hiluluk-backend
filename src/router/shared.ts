import client from "../client";
import sanitizeHtml from "sanitize-html";

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
