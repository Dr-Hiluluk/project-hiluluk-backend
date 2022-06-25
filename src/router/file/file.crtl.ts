import * as express from "express";
import FileService from "./file.service";

class FileController {
  static async createUrl(req: express.Request, res: express.Response) {
    const { type, refId, filename } = req.body;
    const {
      user: { id, nickname },
    } = res.locals;
    try {
      const result = await FileService.createUrl(
        id,
        nickname,
        type,
        filename,
        refId
      );
      if (!result.ok) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(200).json(result.data);
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }
  }

  static async uploadImage(req: express.Request, res: express.Response) {
    const { type, refId } = req.body;
    const {
      user: { id, nickname },
    } = res.locals;

    try {
      if (req.file) {
        const result = await FileService.uploadImage(
          id,
          nickname,
          type,
          Number(refId),
          req.file
        );
        if (!result.ok) {
          return res.status(400).json({ error: result.error });
        }
        return res.status(200).send(result.data);
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  }
}

export default FileController;
