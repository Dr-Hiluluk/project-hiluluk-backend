import AWS from "aws-sdk";
import { createReadStream } from "fs";
import mime from "mime";
import multer from "multer";

export const BUCKET_NAME = "s3.images.drhiluluk";

export const s3 = new AWS.S3({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export const generateSignedUrl = (path: string, filename: string) => {
  const contentType = mime.lookup(filename);
  if (!contentType) {
    const error = new Error("Failed to parse Content-Type from filename");
    error.name = "ContentTypeError";
    throw error;
  }
  if (!contentType.includes("image")) {
    const error = new Error("Given file is not a image");
    error.name = "ContentTypeError";
    throw error;
  }
  const uploadPath = `${path}/${filename}`;

  return s3.getSignedUrl("putObject", {
    Bucket: BUCKET_NAME,
    Key: uploadPath,
    ContentType: contentType,
  });
};

export const uploadToS3 = async (path: string, file: Express.Multer.File) => {
  const { Location } = await s3
    .upload({
      Bucket: BUCKET_NAME,
      Key: path,
      ACL: "public-read",
      Body: file.buffer,
    })
    .promise();
  return Location;
};

export const generateUploadPath = ({
  id,
  type,
  nickname,
}: {
  id: number;
  type: string;
  nickname: string;
}) => {
  return `images/${nickname}/${type}/${id}`;
};

export const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
});
