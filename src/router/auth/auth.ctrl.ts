import { User } from "@prisma/client";
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
      const result = await AuthService.register(user);
      if (result.status === 409) {
        return res.status(409).json({
          error: "Conflict 회원가입 실패",
        });
      }
      if (!result.ok) {
        return res.status(400).json("회원가입 실패");
      }
      if (result.data) {
        const {
          data: { id, name, nickname },
        } = result;
        req.session.user = {
          id: id,
          name: name,
          nickname: nickname,
        };
      }
      return res.status(201).json(req.session.user);
    } catch (e: any) {
      res.status(500).json({ error: e });
    }
  }
  static async login(req: express.Request, res: express.Response) {
    try {
      const loginInputInfo = req.body;
      const loginUser = await AuthService.login(loginInputInfo);
      if (loginUser) {
        if (req.session.user && req.session.user.id !== loginUser.id) {
          req.session.destroy(() => {});
          res.clearCookie("connect.sid");
        }
        req.session.user = {
          id: loginUser.id,
          name: loginUser.name,
          nickname: loginUser.nickname,
        };
        res.status(200).json(req.session.user);
      } else {
        res.clearCookie("connect.sid");
        res.status(401).json({
          error: "로그인 실패",
        });
      }
    } catch (e: any) {
      res.status(500).json({
        error: e,
      });
    }
  }

  static loginCheck(req: express.Request, res: express.Response) {
    if (req.session.user) {
      res.status(200).json(req.session.user);
    } else {
      res.status(401).json({
        error: "로그인 상태가 아닙니다. 다시 로그인 해주세요.",
      });
    }
  }

  static authCheck(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.session.user) {
      return next();
    } else {
      res.status(401).json({
        error: "권한이 없습니다. 다시 로그인 해주세요.",
      });
    }
  }

  static async logout(req: express.Request, res: express.Response) {
    try {
      const userId = req.session?.user?.id;
      const result = await AuthService.logout(userId);
      if (!result.ok) {
        return res.status(400).json("로그아웃 실패");
      }
      if (result.data) {
        req.session.destroy;
        res.clearCookie("connect.sid");
        return res.status(204).send();
      }
    } catch (e) {
      res.status(401).json({
        error: e,
      });
    }
  }
}
export { AuthController };
