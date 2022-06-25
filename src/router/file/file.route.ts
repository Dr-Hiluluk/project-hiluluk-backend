import express, { Router } from "express";
import { AuthController } from "../auth/auth.ctrl";
import { upload } from "./file";
import FileController from "./file.crtl";

const fileRouter: Router = express.Router();

fileRouter.post(
  "/create-url",
  AuthController.authCheck,
  FileController.createUrl
);
fileRouter.post(
  "/upload",
  upload.single("image"),
  AuthController.authCheck,
  FileController.uploadImage
);

export default fileRouter;
