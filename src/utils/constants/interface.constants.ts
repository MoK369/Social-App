import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import type Mail from "nodemailer/lib/mailer/index.js";
import type { Socket } from "socket.io";
import type { HIUser } from "../../db/interfaces/user.interface.ts";

export interface IEmailPayload extends Mail.Options {
  otp?: string;
  taggingUser?: string;
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

export interface IAuthSocket extends Socket {
  credentials?: {
    user: Partial<HIUser>;
    payload: JwtPayload;
  };
}
