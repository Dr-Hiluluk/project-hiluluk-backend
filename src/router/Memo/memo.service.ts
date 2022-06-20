import client from "../../client";

class MemoService {
  static async createMemo({
    userId,
    content,
    refDate,
  }: {
    userId: number;
    content: string;
    refDate: string;
  }) {
    try {
      const memo = await client.memo.create({
        data: {
          userId,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
          refDate,
        },
      });
      return {
        ok: true,
        data: memo,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async readMemoList({
    nickname,
    yearMonth,
  }: {
    nickname: string;
    yearMonth: string;
  }) {
    try {
      const memo = await client.memo.findMany({
        where: {
          AND: [
            {
              user: {
                nickname,
              },
            },
            {
              refDate: {
                startsWith: yearMonth,
              },
            },
          ],
        },
      });
      return {
        ok: true,
        data: memo,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async updateMemo({ id, content }: { id: number; content: string }) {
    try {
      const memo = await client.memo.update({
        where: {
          id,
        },
        data: {
          content,
          updatedAt: new Date(),
        },
      });
      return {
        ok: true,
        data: memo,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  static async deleteMemo({ id }: { id: number }) {
    try {
      const memo = await client.memo.delete({
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

export default MemoService;
