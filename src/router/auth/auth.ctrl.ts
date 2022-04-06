import * as express from "express";
import { AuthService } from "./auth.service";

class AuthController {
  static async register(req: express.Request, res: express.Response) {
    try {
      const user = req.body;
      const registerStatus = await AuthService.register(user);
      if (registerStatus === 409) {
        res.status(409).json({
          status: 409,
          message: "Conflict 회원가입 실패",
        });
      } else {
        res.status(201).json({
          status: 201,
          message: "회원가입 성공",
          data: registerStatus,
        });
      }
    } catch (e: any) {
      throw new Error("500:", e);
    }
  }
  static async login(req: express.Request, res: express.Response) {
    try {
      const user = req.body;
      const loginUser = await AuthService.login(user);
      if (loginUser) {
        res.status(200).json({
          status: 200,
          message: "로그인 성공",
          data: loginUser,
        });
      } else {
        res.status(401).json({
          status: 401,
          message: "로그인 실패",
          error: loginUser,
        });
      }
    } catch (e: any) {
      res.status(500).json({
        status: 500,
        message: e,
      });
    }
  }
}
export { AuthController };
