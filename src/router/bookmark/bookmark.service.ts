import client from "../../client";

class BookmarkService {
  static async createBookmark({
    userId,
    postId,
  }: {
    userId: number;
    postId: number;
  }) {
    try {
      const bookmark = await client.bookmark.create({
        data: {
          userId,
          postId,
        },
      });
      return {
        ok: true,
        data: bookmark,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async getBookmarks(userId: number) {
    try {
      const bookmarks = await client.bookmark.findMany({
        where: {
          userId,
        },
      });
      return {
        ok: true,
        data: bookmarks,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async deleteBookmark({
    userId,
    postId,
  }: {
    userId: number;
    postId: number;
  }) {
    try {
      await client.bookmark.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
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

export default BookmarkService;
