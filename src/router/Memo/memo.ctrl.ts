import * as express from "express";
import MemoService from "./memo.service";

class MemoController {
  static async createMemo(req: express.Request, res: express.Response) {
    const { refDate, content } = req.body;
    const {
      user: { id },
    } = res.locals;
    try {
      const result = await MemoService.createMemo({
        userId: id,
        content: content,
        refDate,
      });
      if (!result.ok) {
        return res.status(400).json(result.error);
      }
      return res.status(201).json(result.data);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async readMemoList(req: express.Request, res: express.Response) {
    const nickname = req.query.nickname as string;
    const yearMonth = req.query.yearMonth as string;
    try {
      const result = await MemoService.readMemoList({
        nickname,
        yearMonth,
      });
      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json(result.data);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async updateMemo(req: express.Request, res: express.Response) {
    const memoId = Number(req.query.memoId as string);
    const content = req.query.content as string;
    try {
      const result = await MemoService.updateMemo({ id: memoId, content });
      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(201).send(result.data);
    } catch (e) {
      return res.status(500).send(e);
    }
  }

  static async deleteMemo(req: express.Request, res: express.Response) {
    const { memoId } = req.params;
    try {
      const result = await MemoService.deleteMemo({ id: Number(memoId) });
      if (!result.ok) {
        return res.status(400).send({ error: result.error });
      }
      return res.status(200).send(result.data);
    } catch (e) {
      return res.status(500).send(e);
    }
  }
}

export default MemoController;
