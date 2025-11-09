import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import type Mail from "nodemailer/lib/mailer/index.js";

export interface IEmailPayload extends Mail.Options {
  otp: string;
}

export interface IS3UploadPayload {
  userId: Types.ObjectId;
  oldSubKey?: string | undefined;
  newSubKey: string;
  presignedUrlExpiresInSeconds?: number; // in seconds
}

export interface ITokenPayload extends JwtPayload {
  id: Types.ObjectId;
}
