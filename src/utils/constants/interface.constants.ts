import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import type Mail from "nodemailer/lib/mailer/index.js";
import type { Socket } from "socket.io";
import type { HIUser } from "../../db/interfaces/user.interface.ts";
import type { TaggedInEnum } from "./enum.constants.ts";
import type {
  FindFunctionsReturnType,
  LeanType,
} from "../types/find_functions.type.ts";
import type { FindPostCursorFunctionReturnType } from "../types/find_post_cursor_function.type.ts";
import type { IPost } from "../../db/interfaces/post.interface.ts";
import type Stream from "node:stream";

export interface IEmailPayload extends Mail.Options {
  otp?: string;
  taggingUser?: string;
  taggedIn?: TaggedInEnum;
}

export interface IMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  stream?: Stream.Readable | undefined;
  size: number;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination?: string | undefined;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename?: string | undefined;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path?: string | undefined;
  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer?: Buffer | undefined;
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

export interface IPaginationResult<TDocument, TLean extends LeanType = false>
  extends IPaginationMetaData {
  data?: FindFunctionsReturnType<TDocument, TLean>[];
}

export interface IPaginationPostResult<TLean extends LeanType = false>
  extends IPaginationMetaData {
  data?: FindFunctionsReturnType<IPost, TLean>[];
  result?: FindPostCursorFunctionReturnType<TLean>;
}

export interface IPaginationMetaData {
  totalCount?: number | undefined;
  totalPages?: number | undefined;
  currentPage?: number | undefined;
  size?: number | undefined;
}
