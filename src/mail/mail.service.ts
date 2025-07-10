import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://localhost:3000/auth/set-password?token=${token}`;
    console.log(`Sending password reset email to ${email} with link: ${resetLink}`);
    // In a real application, you would use a library like Nodemailer here
  }
}
