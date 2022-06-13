import * as express from "express";
import FileService from "./file.service";

class FileController {
  static async createUrl(req: express.Request, res: express.Response) {
    const { type, refId, filename } = req.body;
    try {
      if (req.session.user) {
        const fileUrl = await FileService.createUrl(
          req.session.user.id,
          req.session.user.nickname,
          type,
          filename,
          refId
        );
        if (fileUrl.ok) {
          return res.status(200).json(fileUrl.data);
        }
        return res.status(400).send(fileUrl);
      }
      return res.status(400).send("로그인 필요.");
    } catch (e) {
      console.error(e);
      return res.status(500).send(e);
    }
  }

  static async uploadImage(req: express.Request, res: express.Response) {
    const { type, refId } = req.body;
    try {
      if (req.session.user && req.file) {
        const image = await FileService.uploadImage(
          req.session.user.id,
          req.session.user.nickname,
          type,
          Number(refId),
          req.file
        );
        if (image.ok) {
          return res.status(200).send(image.data);
        }
        return res.status(400).send(image.data);
      }
      return res.status(400).send("로그인 필요.");
    } catch (e) {
      return res.status(500).send(e);
    }
  }
}

export default FileController;
