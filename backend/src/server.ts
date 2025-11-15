import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import userRouter from "./routes/user.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS 설정 (프론트 포트 확인)
app.use(
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  })
);

// cookie-session 설정
if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
  throw new Error("Missing cookie keys!");
}

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_PRIMARY_KEY!, process.env.COOKIE_SECONDARY_KEY!],
    maxAge: 3 * 60 * 1000,
    sameSite: "lax", // ✅ 반드시 추가
  })
);

app.use(express.json());
app.use("/users", userRouter);

// 404 처리
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Invalid route!" });
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
