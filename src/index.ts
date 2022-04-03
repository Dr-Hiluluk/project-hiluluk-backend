import * as dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./router";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, AUTHORIZATION"
  );
  next();
});

app.use(router);

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

if (!PORT) {
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🌈 Server is now running on http://localhost:${PORT}/`);
});

export { app };
