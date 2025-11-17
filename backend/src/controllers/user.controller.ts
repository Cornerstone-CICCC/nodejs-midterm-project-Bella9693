import { Request, Response } from "express";
import userModel from "../models/user.model";
import { User } from "../types/user";
import bcrypt from "bcrypt";

declare module "express-session" {
  interface SessionData {
    isLoggedIn?: boolean;
    userId?: string;
  }
}

/**
 * Sign up (add user)
 * @route POST /users/signup
 */
const signup = async (
  req: Request<{}, {}, Omit<User, "id">>,
  res: Response
) => {
  const { email, password, username } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Email or password is missing!" });
  }

  const newUser = await userModel.createUser({
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
};

/**
 * Log in (check user)
 * @route POST /users/login
 */
const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Email or password is empty!" });
  }

  const user = await userModel.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Incorrect email or password!" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
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
};

/**
 * Get user account
 * @route GET /users/account
 */
const getAccount = (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Login required!" });

  const user = userModel.getAll().find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found!" });

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
const logout = (req: Request, res: Response) => {
  if (req.session) (req.session as any) = null;
  res.status(200).json({ message: "Logout successful!" });
};

/**
 * Change password
 * @route POST /users/change-password
 */
const changePassword = async (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Login required!" });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Passwords cannot be empty!" });
  }

  const user = userModel.getAll().find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: "User not found!" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Old password is incorrect!" });

  const hashedNew = await bcrypt.hash(newPassword, 12);
  const updated = userModel.updateUser(userId, { password: hashedNew });

  if (!updated)
    return res.status(500).json({ message: "Failed to update password!" });

  res.status(200).json({ message: "Password changed successfully!" });
};

/**
 * Delete account
 * @route DELETE /users/delete
 */
const deleteAccount = (req: Request, res: Response) => {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Login required!" });

  const index = userModel.getAll().findIndex((u) => u.id === userId);
  if (index === -1) return res.status(404).json({ message: "User not found!" });

  userModel.getAll().splice(index, 1);

  // 로그아웃 처리
  if (req.session) (req.session as any) = null;

  res.status(200).json({ message: "Account deleted successfully!" });
};

export default {
  signup,
  login,
  getAccount,
  logout,
  changePassword,
  deleteAccount,
};
