import { User } from "@prisma/client";
import client from "../../client";
import { BUCKET_NAME, generateSignedUrl, generateUploadPath } from "./file";
import { uploadToS3 } from "./file";
class FileService {
  static async createUrl(
    userId: number,
    nickname: string,
    type: string,
    filename: string,
    refId: number
  ) {
    try {
      let image = await client.image.create({
        data: {
          userId: userId,
          filesize: 0,
          path: "",
          type,
          refId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const path = generateUploadPath({
        id: image.id,
        nickname: nickname,
        type,
      });
      image = await client.image.update({
        where: {
          id: image.id,
        },
        data: {
          path: `${path}/${filename}`,
        },
      });
      const signedUrl = generateSignedUrl(path, filename);
      return {
        ok: true,
        data: {
          imagePath: `https://s3.ap-northeast-2.amazonaws.com/${BUCKET_NAME}/${image.path}`,
          signedUrl,
        },
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }

  static async uploadImage(
    userId: number,
    nickname: string,
    type: string,
    refId: number,
    file: Express.Multer.File
  ) {
    if (type === "post") {
      const post = await client.post.findFirst({
        where: {
          id: refId,
        },
      });
      if (!post) {
        return {
          ok: false,
        };
      }
    }
    try {
      const image = await client.image.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          filesize: file.size,
          path: "",
          type,
          refId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const originalFileName = file.originalname;
      const extension = originalFileName.split(".").pop();
      const filename = `image.${extension}`;
      const path = generateUploadPath({
        id: image.id,
        type,
        nickname: nickname,
      }).concat(`/${encodeURIComponent(decodeURI(filename))}`);

      await client.image.update({
        where: {
          id: image.id,
        },
        data: {
          path,
          filesize: file.size,
        },
      });
      const location = await uploadToS3(path, file);
      return {
        ok: true,
        data: location,
      };
    } catch (e) {
      console.error(e);
      return {
        ok: false,
      };
    }
  }
}

export default FileService;
