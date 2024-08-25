import { customRandom, nanoid, random } from "nanoid";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import sgMail from "@sendgrid/mail";
import * as jwt from "jose";

import * as schema from "@/app/(modules)/db/schema";
import {
  userTable,
  otpTable,
  refreshTokenTable,
} from "@/app/(modules)/db/schema";
import { env } from "@/app/env.mjs";
import { db } from "@/app/(modules)/db/db";

// export interface User {
//   username: string;
//   email: string;
//   displayName?: string;
//   avatar?: string;
// }

// TODO: API endpoint to enter more details about new user

enum AccessTokenGenerationType {
  LOGIN = "LOGIN",
  REFRESH = "REFRESH",
}

export async function sendOTP(
  db: LibSQLDatabase<typeof schema>,
  email: string
) {
  const otp = customRandom("0123456789", 6, random)();

  sgMail.setApiKey(env.SENDGRID_API_KEY);
  sgMail
    .send({
      to: email,
      from: {
        name: "Chax",
        email: env.SENDGRID_SENDER_EMAIL,
      },
      subject: "Chax Email Verification OTP",
      text: otp,
      html: getEmailHTML(otp),
    })
    .then(async () => {
      await db.insert(otpTable).values({
        email: email,
        number: Number(otp),
      });
    })
    .catch((error) => {
      const errorMessage: any = {
        error: error.message,
        errorCode: 400,
      };

      console.error(error.message);
      if (error.response) {
        errorMessage.errorResponse = error.response.body;
        console.error(error.response.body);
      }

      return errorMessage;
    });

  return {
    message: `OTP sent to ${email}. Check your inbox`,
  };
}

function getEmailHTML(otp: string) {
  return `
  <html lang="en">
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #1e1e2e;
          margin: 0;
          padding: 20px;
          color: #cdd6f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #181825;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        h1 {
          color: #f5c2e7;
          text-align: center;
        }
        .otp-container {
          text-align: center;
          margin: 30px 0;
        }
        .otp {
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #cba6f7;
          background-color: #313244;
          padding: 10px 20px;
          border-radius: 4px;
          display: inline-block;
        }
        p {
          color: #a6adc8;
          line-height: 1.6;
        }
        .highlight {
          color: #f9e2af;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your One-Time Password</h1>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for account verification is:</p>
        <div class="otp-container">
          <span class="otp">${otp}</span>
        </div>
        <p>Please use this OTP to complete your verification process. This code will expire in <span class="highlight">10 minutes</span>.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <p>Best regards,<br><span class="highlight">Chax</span></p>
      </div>
    </body>
  </html>
  `;
}

export async function authenticate(
  db: LibSQLDatabase<typeof schema>,
  email: string,
  otp: string
) {
  // Validate OTP
  const otpEntry = await db.query.otpTable.findFirst({
    where: eq(otpTable.email, email),
  });

  if (!otpEntry) {
    return {
      error: "OTP has not been sent to this email",
      errorCode: 400,
    };
  }

  const otpExpiryMinutes = 10;
  if (
    (Date.now() - otpEntry.createdAt.getTime()) / 1000 / 60 >
    otpExpiryMinutes
  ) {
    await db.delete(otpTable).where(eq(otpTable.email, email));

    return {
      error: "OTP has expired",
      errorCode: 400,
    };
  }

  if (otpEntry.number !== Number(otp)) {
    return {
      error: "Incorrect OTP",
      errorCode: 400,
    };
  }

  await db.delete(otpTable).where(eq(otpTable.email, email));

  // User authentication
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  // Create a fresh user if not already registered
  if (!user) {
    const newUser: any = await db
      .insert(userTable)
      .values({
        email: email,
        username: email.split("@")[0],
        verified: true,
      })
      .returning();
    return {
      message: "User registered successfully!",
      userId: newUser.id,
      accessToken: await generateAccessToken(
        newUser.id,
        AccessTokenGenerationType.LOGIN
      ),
      refreshToken: await generateRefreshToken(newUser.id),
    };
  }

  return {
    message: "User login successful!",
    accessToken: await generateAccessToken(
      user.id,
      AccessTokenGenerationType.LOGIN
    ),
    refreshToken: await generateRefreshToken(user.id),
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const { payload } = await jwt.jwtVerify(
    refreshToken,
    new TextEncoder().encode(env.REFRESH_TOKEN_SECRET)
  );

  const tokenEntry = await db.query.refreshTokenTable.findFirst({
    where: eq(refreshTokenTable.id, payload.jti!),
  });

  if (!tokenEntry) {
    return {
      error: "Invalid refresh token",
      errorCode: 403,
    };
  }

  return {
    message: "New access token generated",
    accessToken: await generateAccessToken(
      payload.sub!,
      AccessTokenGenerationType.REFRESH
    ),
  };
}

async function generateAccessToken(
  userId: string,
  generationType: AccessTokenGenerationType
) {
  const secret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
  const token = await new jwt.SignJWT({ gen: generationType })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("10m")
    .sign(secret);
  return token;
}

async function generateRefreshToken(userId: string) {
  const tokenId = nanoid();

  const secret = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET);
  const token = await new jwt.SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setJti(tokenId)
    .setSubject(userId)
    .setExpirationTime("4w")
    .sign(secret);

  await db.insert(refreshTokenTable).values({
    id: tokenId,
  });

  return token;
}
