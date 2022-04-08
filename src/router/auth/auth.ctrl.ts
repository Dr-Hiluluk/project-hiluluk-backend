import * as express from "express";
import { AuthService } from "./auth.service";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      nickname: string;
      name: string;
    };
  }
}
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
        req.session.user = {
          id: registerStatus.id,
          name: registerStatus.name,
          nickname: registerStatus.nickname,
        };
        res.status(201).json({
          status: 201,
          data: req.session.user,
        });
      }
    } catch (e: any) {
      throw new Error("500:", e);
    }
  }
  static async login(req: express.Request, res: express.Response) {
    try {
      const loginInputInfo = req.body;
      const loginUser = await AuthService.login(loginInputInfo);
      if (loginUser) {
        if (req.session.user && req.session.user.id !== loginUser.id) {
          req.session.destroy(() => {});
        }
        req.session.user = {
          id: loginUser.id,
          name: loginUser.name,
          nickname: loginUser.nickname,
        };
        res.status(200).json({
          status: 200,
          message: "로그인 성공",
          data: req.session.user,
        });
      } else {
        res.status(401).json({
          status: 401,
          message: "로그인 실패",
          error: loginUser,
        });
      }
    } catch (e: any) {
      console.log("e:", e);
      res.status(500).json({
        status: 500,
        message: e,
      });
    }
  }

  static loginCheck(req: express.Request, res: express.Response) {
    if (req.session.user) {
      res.status(200).json({
        status: 200,
        data: req.session.user,
      });
    } else {
      res.status(401).json({
        status: 401,
        message: "로그인 상태가 아닙니다. 다시 로그인 해주세요.",
      });
    }
  }
}
export { AuthController };
