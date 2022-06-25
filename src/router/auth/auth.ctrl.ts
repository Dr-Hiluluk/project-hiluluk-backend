import { User } from "@prisma/client";
import * as express from "express";
import client from "../../client";
import { AuthService } from "./auth.service";

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      nickname: string;
      name: string;
      description: string | null;
      thumbnail: string | null;
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
        return res.status(400).json({ error: "회원가입 실패" });
      }
      if (result.data) {
        const {
          data: { id, name, nickname, description, thumbnail },
        } = result;
        req.session.user = {
          id: id,
          name: name,
          nickname: nickname,
          description: description,
          thumbnail: thumbnail,
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
      if (!loginUser) {
        res.clearCookie("connect.sid");
        return res.status(400).send({
          error:
            "이메일 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.",
        });
      }

      if (req.session.user && req.session.user.id !== loginUser.id) {
        req.session.destroy(() => {});
        res.clearCookie("connect.sid");
      }
      req.session.user = {
        id: loginUser.id,
        name: loginUser.name,
        nickname: loginUser.nickname,
        description: loginUser.description,
        thumbnail: loginUser.thumbnail,
      };
      return res.status(200).json(req.session.user);
    } catch (e: any) {
      return res.status(500).json({
        error: e,
      });
    }
  }

  static async loginCheck(req: express.Request, res: express.Response) {
    try {
      if (req.session.user) {
        const user = await client.user.findFirst({
          where: {
            id: req.session.user.id,
          },
          select: {
            id: true,
            name: true,
            nickname: true,
            description: true,
            thumbnail: true,
          },
        });
        if (user) {
          req.session.user = {
            id: user.id,
            name: user.name,
            nickname: user.nickname,
            description: user.description,
            thumbnail: user.thumbnail,
          };
        }
        res.status(200).json(user);
      } else {
        res.status(401).json({
          error: "로그인 상태가 아닙니다. 다시 로그인 해주세요.",
        });
      }
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  }

  static authCheck(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.session.user) {
      res.locals.user = req.session.user;
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
        return res.status(400).json({ error: "로그아웃 실패" });
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
