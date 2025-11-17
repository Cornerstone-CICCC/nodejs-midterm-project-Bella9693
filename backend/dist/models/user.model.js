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
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
class UserModel {
    constructor() {
        this.users = [];
    }
    createUser(newUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, username } = newUser;
            const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
            if (existing)
                return false;
            const hashedPassword = yield bcrypt_1.default.hash(password, 12);
            const user = {
                id: (0, uuid_1.v4)(),
                email,
                password: hashedPassword,
                username,
            };
            this.users.push(user);
            return user;
        });
    }
    loginUser(email, plainPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
            if (!user)
                return false;
            const isMatch = yield bcrypt_1.default.compare(plainPassword, user.password);
            if (!isMatch)
                return false;
            return user;
        });
    }
    getUserByEmail(email) {
        const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        return user || false;
    }
    getAll() {
        return this.users;
    }
    seedUser(email_1, plainPassword_1) {
        return __awaiter(this, arguments, void 0, function* (email, plainPassword, username = "Test") {
            const hashed = yield bcrypt_1.default.hash(plainPassword, 12);
            return this.createUser({
                email,
                password: hashed,
                username,
            });
        });
    }
    /**
     * Update user fields (partial)
     */
    updateUser(id, updatedUser) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1)
            return false;
        this.users[index] = Object.assign(Object.assign({}, this.users[index]), updatedUser);
        return true;
    }
    /**
     * Delete user by id
     */
    deleteUser(id) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1)
            return false;
        this.users.splice(index, 1);
        return true;
    }
}
exports.default = new UserModel();
