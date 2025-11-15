"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS 설정 (프론트 포트 확인)
app.use((0, cors_1.default)({
    origin: "http://localhost:4321",
    credentials: true,
}));
// cookie-session 설정
if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
    throw new Error("Missing cookie keys!");
}
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: [process.env.COOKIE_PRIMARY_KEY, process.env.COOKIE_SECONDARY_KEY],
    maxAge: 3 * 60 * 1000,
    sameSite: "lax", // ✅ 반드시 추가
}));
app.use(express_1.default.json());
app.use("/users", user_routes_1.default);
// 404 처리
app.use((req, res, next) => {
    res.status(404).json({ message: "Invalid route!" });
});
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
