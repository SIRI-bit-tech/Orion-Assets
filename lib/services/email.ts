import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static instance: EmailService;
  private defaultFrom: string;

  private constructor() {
    this.defaultFrom = process.env.EMAIL_FROM || "noreply@orionassets.com";
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // Use fetch API to send email via external service
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: process.env.EMAILJS_TEMPLATE_ID,
            user_id: process.env.EMAILJS_USER_ID,
            template_params: {
              to_email: data.to,
              subject: data.subject,
              message: data.text || data.html,
              from_name: "Orion Assets Broker",
              reply_to: this.defaultFrom,
            },
          }),
        },
      );

      if (response.ok) {
        // Log successful email to database
        await this.logEmail({
          to: data.to,
          subject: data.subject,
          status: "sent",
          messageId: `email-${Date.now()}`,
          sentAt: new Date(),
        });
        return true;
      } else {
        throw new Error(
          `Email service responded with status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error("Failed to send email:", error);

      await this.logEmail({
        to: data.to,
        subject: data.subject,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        sentAt: new Date(),
      });

      return false;
    }
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
  ): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendVerificationEmail(
    userEmail: string,
    userName: string,
    verificationUrl: string,
  ): Promise<boolean> {
    const template = this.getVerificationTemplate(userName, verificationUrl);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetUrl: string,
  ): Promise<boolean> {
    const template = this.getPasswordResetTemplate(userName, resetUrl);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendTradeConfirmationEmail(
    userEmail: string,
    userName: string,
    tradeDetails: {
      symbol: string;
      side: "BUY" | "SELL";
      quantity: number;
      price: number;
      total: number;
      executedAt: Date;
    },
  ): Promise<boolean> {
    const template = this.getTradeConfirmationTemplate(userName, tradeDetails);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendPriceAlertEmail(
    userEmail: string,
    userName: string,
    alertDetails: {
      symbol: string;
      condition: string;
      targetPrice: number;
      currentPrice: number;
    },
  ): Promise<boolean> {
    const template = this.getPriceAlertTemplate(userName, alertDetails);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async sendAccountStatusEmail(
    userEmail: string,
    userName: string,
    status: string,
    message: string,
  ): Promise<boolean> {
    const template = this.getAccountStatusTemplate(userName, status, message);

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    return {
      subject: "Welcome to Orion Assets Broker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Orion Assets Broker, ${userName}!</h2>
          <p>Thank you for joining Orion Assets Broker. Your trading account has been successfully created.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Getting Started:</h3>
            <ul style="color: #4b5563;">
              <li>Complete your KYC verification</li>
              <li>Fund your account to start trading</li>
              <li>Explore our trading platform and tools</li>
              <li>Set up price alerts for your favorite stocks</li>
            </ul>
          </div>
          <p><a href="${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard"
               style="background-color: #2563eb; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
            Access Your Dashboard
          </a></p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `,
      text: `Welcome to Orion Assets Broker, ${userName}!

Thank you for joining Orion Assets Broker. Your trading account has been successfully created.

Getting Started:
- Complete your KYC verification
- Fund your account to start trading
- Explore our trading platform and tools
- Set up price alerts for your favorite stocks

Access your dashboard: ${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard

If you have any questions, please contact our support team.`,
    };
  }

  private getVerificationTemplate(
    userName: string,
    verificationUrl: string,
  ): EmailTemplate {
    return {
      subject: "Verify Your Email Address - Orion Assets Broker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Verification Required</h2>
          <p>Hello ${userName},</p>
          <p>Please verify your email address to complete your account setup and start trading.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #16a34a; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
      text: `Email Verification Required

Hello ${userName},

Please verify your email address to complete your account setup and start trading.

Verification link: ${verificationUrl}

This link will expire in 24 hours. If you didn't create an account, please ignore this email.`,
    };
  }

  private getPasswordResetTemplate(
    userName: string,
    resetUrl: string,
  ): EmailTemplate {
    return {
      subject: "Reset Your Password - Orion Assets Broker",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your Orion Assets Broker account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #dc2626; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      `,
      text: `Password Reset Request

Hello ${userName},

We received a request to reset your password for your Orion Assets Broker account.

Reset link: ${resetUrl}

This link will expire in 1 hour. If you didn't request this reset, please ignore this email.`,
    };
  }

  private getTradeConfirmationTemplate(
    userName: string,
    tradeDetails: any,
  ): EmailTemplate {
    const { symbol, side, quantity, price, total, executedAt } = tradeDetails;

    return {
      subject: `Trade Confirmation - ${side} ${symbol}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Trade Executed Successfully</h2>
          <p>Hello ${userName},</p>
          <p>Your trade has been executed successfully.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Trade Details:</h3>
            <table style="width: 100%; color: #4b5563;">
              <tr><td><strong>Symbol:</strong></td><td>${symbol}</td></tr>
              <tr><td><strong>Action:</strong></td><td>${side}</td></tr>
              <tr><td><strong>Quantity:</strong></td><td>${quantity.toLocaleString()} shares</td></tr>
              <tr><td><strong>Price:</strong></td><td>$${price.toFixed(2)}</td></tr>
              <tr><td><strong>Total:</strong></td><td>$${total.toFixed(2)}</td></tr>
              <tr><td><strong>Executed:</strong></td><td>${executedAt.toLocaleString()}</td></tr>
            </table>
          </div>
          <p><a href="${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/positions"
               style="background-color: #2563eb; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
            View Your Positions
          </a></p>
        </div>
      `,
      text: `Trade Executed Successfully

Hello ${userName},

Your trade has been executed successfully.

Trade Details:
Symbol: ${symbol}
Action: ${side}
Quantity: ${quantity.toLocaleString()} shares
Price: $${price.toFixed(2)}
Total: $${total.toFixed(2)}
Executed: ${executedAt.toLocaleString()}

View your positions: ${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/dashboard/positions`,
    };
  }

  private getPriceAlertTemplate(
    userName: string,
    alertDetails: any,
  ): EmailTemplate {
    const { symbol, condition, targetPrice, currentPrice } = alertDetails;

    return {
      subject: `Price Alert: ${symbol} - ${condition} $${targetPrice}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Price Alert Triggered</h2>
          <p>Hello ${userName},</p>
          <p>Your price alert for <strong>${symbol}</strong> has been triggered.</p>
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Alert Details:</h3>
            <p style="color: #92400e; margin: 5px 0;">
              <strong>${symbol}</strong> is now <strong>${condition}</strong> your target price of <strong>$${targetPrice.toFixed(2)}</strong>
            </p>
            <p style="color: #92400e; margin: 5px 0;">
              Current Price: <strong>$${currentPrice.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      `,
      text: `Price Alert Triggered

Hello ${userName},

Your price alert for ${symbol} has been triggered.

Alert Details:
${symbol} is now ${condition} your target price of $${targetPrice.toFixed(2)}
Current Price: $${currentPrice.toFixed(2)}`,
    };
  }

  private getAccountStatusTemplate(
    userName: string,
    status: string,
    message: string,
  ): EmailTemplate {
    const statusColors = {
      approved: "#16a34a",
      rejected: "#dc2626",
      suspended: "#ea580c",
      pending: "#2563eb",
    };

    const color =
      statusColors[status as keyof typeof statusColors] || "#6b7280";

    return {
      subject: `Account Status Update - ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${color};">Account Status Update</h2>
          <p>Hello ${userName},</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
            <h3 style="color: #1f2937; margin-top: 0;">Status: ${status.toUpperCase()}</h3>
            <p style="color: #4b5563;">${message}</p>
          </div>
        </div>
      `,
      text: `Account Status Update

Hello ${userName},

Status: ${status.toUpperCase()}
${message}`,
    };
  }

  private async logEmail(emailLog: {
    to: string;
    subject: string;
    status: "sent" | "failed";
    messageId?: string;
    error?: string;
    sentAt: Date;
  }): Promise<void> {
    try {
      const db = await getDb();
      await db.collection("email_logs").insertOne(emailLog);
    } catch (error) {
      console.error("Failed to log email:", error);
    }
  }

  async getEmailStats(
    userId?: string,
    days: number = 30,
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    byType: Record<string, number>;
  }> {
    try {
      const db = await getDb();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query: any = { sentAt: { $gte: startDate } };
      if (userId) {
        query.userId = new ObjectId(userId);
      }

      const logs = await db.collection("email_logs").find(query).toArray();

      const stats = {
        total: logs.length,
        sent: logs.filter((log) => log.status === "sent").length,
        failed: logs.filter((log) => log.status === "failed").length,
        byType: logs.reduce((acc: Record<string, number>, log: any) => {
          const type = log.subject.split(" - ")[0] || "Other";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
      };

      return stats;
    } catch (error) {
      console.error("Failed to get email stats:", error);
      return { total: 0, sent: 0, failed: 0, byType: {} };
    }
  }
}

export const emailService = EmailService.getInstance();
