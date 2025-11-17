import { User } from "../types/user";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

class UserModel {
  private users: User[] = [];

  async createUser(newUser: Omit<User, "id">): Promise<User | false> {
    const { email, password, username } = newUser;

    const existing = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) return false;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      username,
    };

    this.users.push(user);
    return user;
  }

  async loginUser(email: string, plainPassword: string): Promise<User | false> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return false;

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) return false;

    return user;
  }

  getUserByEmail(email: string): User | false {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    return user || false;
  }

  getAll(): User[] {
    return this.users;
  }

  async seedUser(
    email: string,
    plainPassword: string,
    username = "Test"
  ): Promise<User> {
    const hashed = await bcrypt.hash(plainPassword, 12);
    return this.createUser({
      email,
      password: hashed,
      username,
    }) as Promise<User>;
  }

  /**
   * Update user fields (partial)
   */
  updateUser(id: string, updatedUser: Partial<User>): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users[index] = { ...this.users[index], ...updatedUser };
    return true;
  }

  /**
   * Delete user by id
   */
  deleteUser(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }
}

export default new UserModel();
