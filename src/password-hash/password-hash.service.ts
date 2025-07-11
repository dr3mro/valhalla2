import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
// If using @types/bcryptjs, TypeScript will infer types correctly

@Injectable()
export class PasswordHashService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password cannot be empty');
    }
    if (typeof password !== 'string') {
      throw new Error('Password must be a string');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      if (!salt) {
        throw new Error('Failed to generate salt');
      }
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      throw new Error(`Error hashing password: ${errorMessage}`);
    }
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      if (typeof bcrypt.compare !== 'function') {
        throw new Error('bcrypt.compare is not a function');
      }
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      throw new Error(`Error comparing passwords: ${errorMessage}`);
    }
  }
}
