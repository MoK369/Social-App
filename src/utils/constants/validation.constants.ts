import { z } from "zod";
import { Buffer } from "buffer";
import fileValidation from "../multer/file_validation.multer.ts";
import { Types } from "mongoose";

const generalValidationFields = {
  objectId: z.string().refine(
    (value) => {
      return Types.ObjectId.isValid(value);
    },
    { error: "Invalid userId" }
  ),
  phone: z.string().regex(/^(002|\+2)?01[0125][0-9]{8}$/),
  password: z
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  confirmPasswordChecker: (
    data: { confirmPassword: string; password: String } & Record<string, any>,
    ctx: z.core.$RefinementCtx
  ) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "confirmPassword mismatch password",
      });
    }
  },
  otp: z
    .string()
    .regex(/^\d{6}$/, { error: "OTP must consists only of 6 digits" }),
  fileKeys: {
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    basePath: z.string(),
    finalPath: z.string(),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number().positive(),
    buffer: z.instanceof(Buffer).refine((buffer) => buffer.length > 0, {
      error: "Buffer must not be empty",
    }),
  },
  originalName: z.string().regex(/^\w{3,}\.(jpg|jpeg|png|gif|pdf|docx|txt)$/, {
    error: "Invalid original file name",
  }),
  imageContentTypes: z.enum(Object.values(fileValidation.image)),
};

export default generalValidationFields;
