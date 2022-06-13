import express, { Router } from "express";
import { upload } from "./file";
import FileController from "./file.crtl";

const fileRouter: Router = express.Router();

fileRouter.post("/create-url", FileController.createUrl);
fileRouter.post("/upload", upload.single("image"), FileController.uploadImage);

export default fileRouter;
