import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./router";
import cookieParser from "cookie-parser";
import session from "express-session";
import createFakeData from "./createFakeData";
const FileStore = require("session-file-store")(session);
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY || "TEMP_SECRET_KEY",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 쿠키 유효기간 24시간
      httpOnly: false,
      secure: "auto",
    },
    store: new FileStore(),
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, AUTHORIZATION"
  );
  next();
});

// createFakeData();

app.use("/api", router);

if (!PORT) {
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🌈 Server is now running on http://localhost:${PORT}/`);
});

export { app };
