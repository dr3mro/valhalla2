import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
// If using @types/bcryptjs, TypeScript will infer types correctly

@Injectable()
export class PasswordHashService {
  // create getter for saltRounds if needed
  private readonly saltRounds = 10;

  getSaltRounds(): number {
    return this.saltRounds;
  }

  async hashPassword(password: string): Promise<string | Error> {
    if (!password) {
      return new Error('Password cannot be empty');
    }
    if (typeof password !== 'string') {
      return new Error('Password must be a string');
    }
    if (password.length < 8) {
      return new Error('Password must be at least 8 characters long');
    }
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      if (!salt) {
        return new Error('Failed to generate salt');
      }
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : String(error);
      return new Error(`Error hashing password: ${errorMessage}`);
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
