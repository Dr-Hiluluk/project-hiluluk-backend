import express from "express";
import MemoController from "./memo.ctrl";
const memoRouter: express.Router = express.Router();

memoRouter.post("/", MemoController.createMemo);
memoRouter.get("/", MemoController.readMemoList);
memoRouter.patch("/", MemoController.updateMemo);
memoRouter.delete("/:memoId", MemoController.deleteMemo);

export default memoRouter;
