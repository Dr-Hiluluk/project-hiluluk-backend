import express from "express";
import { AuthController } from "../auth/auth.ctrl";
import MemoController from "./memo.ctrl";
const memoRouter: express.Router = express.Router();

memoRouter.post("/", AuthController.authCheck, MemoController.createMemo);
memoRouter.get("/", MemoController.readMemoList);
memoRouter.patch("/", AuthController.authCheck, MemoController.updateMemo);
memoRouter.delete(
  "/:memoId",
  AuthController.authCheck,
  MemoController.deleteMemo
);

export default memoRouter;
