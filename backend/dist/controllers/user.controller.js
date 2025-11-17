"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Sign up (add user)
 * @route POST /users/signup
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
        return res.status(400).json({ message: "Email or password is missing!" });
    }
    const newUser = yield user_model_1.default.createUser({
        email,
        password,
        username,
    });
    if (!newUser) {
        return res.status(409).json({ message: "Email is already taken!" });
    }
    res.status(201).json({
        message: "User successfully added!",
        user: { id: newUser.id, email: newUser.email },
    });
});
/**
 * Log in (check user)
 * @route POST /users/login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
        return res.status(400).json({ message: "Email or password is empty!" });
    }
    const user = yield user_model_1.default.getUserByEmail(email);
    if (!user) {
        return res.status(401).json({ message: "Incorrect email or password!" });
    }
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(401).json({ message: "Incorrect email or password!" });
    // ✅ 세션 설정
    if (req.session) {
        req.session.userId = user.id;
        req.session.isLoggedIn = true;
        console.log("Login session:", req.session);
    }
    res.status(200).json({
        message: "Login successful!",
        user: { id: user.id, email: user.email },
    });
});
/**
 * Get user account
 * @route GET /users/account
 */
const getAccount = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId)
        return res.status(401).json({ message: "Login required!" });
    const user = user_model_1.default.getAll().find((u) => u.id === userId);
    if (!user)
        return res.status(404).json({ message: "User not found!" });
    res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
    });
};
/**
 * Logout
 * @route POST /users/logout
 */
const logout = (req, res) => {
    if (req.session)
        req.session = null;
    res.status(200).json({ message: "Logout successful!" });
};
/**
 * Change password
 * @route POST /users/change-password
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId)
        return res.status(401).json({ message: "Login required!" });
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Passwords cannot be empty!" });
    }
    const user = user_model_1.default.getAll().find((u) => u.id === userId);
    if (!user)
        return res.status(404).json({ message: "User not found!" });
    const isMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
    if (!isMatch)
        return res.status(401).json({ message: "Old password is incorrect!" });
    const hashedNew = yield bcrypt_1.default.hash(newPassword, 12);
    const updated = user_model_1.default.updateUser(userId, { password: hashedNew });
    if (!updated)
        return res.status(500).json({ message: "Failed to update password!" });
    res.status(200).json({ message: "Password changed successfully!" });
});
/**
 * Delete account
 * @route DELETE /users/delete
 */
const deleteAccount = (req, res) => {
    var _a;
    const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId)
        return res.status(401).json({ message: "Login required!" });
    const index = user_model_1.default.getAll().findIndex((u) => u.id === userId);
    if (index === -1)
        return res.status(404).json({ message: "User not found!" });
    user_model_1.default.getAll().splice(index, 1);
    // 로그아웃 처리
    if (req.session)
        req.session = null;
    res.status(200).json({ message: "Account deleted successfully!" });
};
exports.default = {
    signup,
    login,
    getAccount,
    logout,
    changePassword,
    deleteAccount,
};
