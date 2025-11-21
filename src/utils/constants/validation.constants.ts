import { z } from "zod";
import { Buffer } from "buffer";
import fileValidation from "../multer/file_validation.multer.ts";
import { Types } from "mongoose";
import { StorageTypesEnum } from "./enum.constants.js";
import Stream from "stream";

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
  fileKeys: function ({
    storageApproach = StorageTypesEnum.memory,
    fieldName,
    mimetype,
    maxSize,
  }: {
    storageApproach?: StorageTypesEnum;
    fieldName: string;
    mimetype: string[];
    maxSize: number;
  }) {
    return z
      .strictObject(
        {
          fieldname: z.string(),
          originalname: z.string(),
          encoding: z.string(),
          mimetype: z.string(),
          stream: z.instanceof(Stream.Readable).optional(),
          basePath: z
            .string()
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.disk)
                  return !value ? false : true;

                return true;
              },
              { error: "basePath is required" }
            ),
          finalPath: z
            .string()
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.disk)
                  return !value ? false : true;

                return true;
              },
              { error: "finalPath is required" }
            ),
          destination: z
            .string()
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.disk)
                  return !value ? false : true;

                return true;
              },
              { error: "destination is required" }
            ),
          filename: z
            .string()
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.disk)
                  return !value ? false : true;

                return true;
              },
              { error: "filename is required" }
            ),
          path: z
            .string()
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.disk)
                  return !value ? false : true;

                return true;
              },
              { error: "path is required" }
            ),
          size: z.number().positive().max(maxSize),
          buffer: z
            .instanceof(Buffer)
            .refine((buffer) => buffer.length > 0)
            .optional()
            .refine(
              (value) => {
                if (storageApproach === StorageTypesEnum.memory)
                  return !value ? false : true;

                return true;
              },
              { error: "buffer must not be empty" }
            ),
        },
        { error: "image is missing" }
      )
      .superRefine((data, ctx) => {
        if (data.fieldname !== fieldName) {
          ctx.addIssue({
            code: "custom",
            path: [fieldName],
            message: `${fieldName} field is required`,
          });
        }
        if (!mimetype.includes(data.mimetype)) {
          ctx.addIssue({
            code: "custom",
            path: [fieldName],
            message: "Invalid Image Type!",
          });
        }
      });
  },
  originalName: z.string().regex(/^\w{3,}\.(jpg|jpeg|png|gif|pdf|docx|txt)$/, {
    error: "Invalid original file name",
  }),
  imageContentTypes: z.enum(Object.values(fileValidation.image)),
};

export default generalValidationFields;
