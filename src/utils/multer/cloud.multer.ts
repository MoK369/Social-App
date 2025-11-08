import multer from "multer";
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { generateAlphaNumaricId } from "../security/id.security.ts";
import type { NextFunction, Request, Response } from "express";
import { ValidationException } from "../exceptions/custom.exceptions.ts";

class CloudMulter {
  private static _tempFolderPath = "./Temp";

  static cloudFileUpload = ({
    validation = [],
    maxFileSize = 512 * 1024,
    storageApproach = StorageTypesEnum.memory,
  }: {
    validation?: string[];
    maxFileSize?: number;
    storageApproach?: StorageTypesEnum;
  } = {}): multer.Multer => {
    const storage =
      storageApproach === StorageTypesEnum.memory
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: async function (
              req: Request,
              file: Express.Multer.File,
              callback
            ) {
              await access(resolve(CloudMulter._tempFolderPath)).catch(
                async (error) => {
                  if (error.code == "ENOENT") {
                    await mkdir(resolve(CloudMulter._tempFolderPath), {
                      recursive: true,
                    });
                  }
                }
              ); // ensure that the /tmp folder exists
              callback(null, CloudMulter._tempFolderPath); // files will be uploaded to /tmp folder first before being uploaded to cloudinary
            },
            filename: function (
              req: Request,
              file: Express.Multer.File,
              callback
            ) {
              callback(
                null,
                `${generateAlphaNumaricId({ size: 24 })}_${file.originalname}`
              );
            },
          });

    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      callback: multer.FileFilterCallback
    ) => {
      if (!validation.includes(file.mimetype)) {
        callback(
          new ValidationException("Invalid File. File must be an image", [
            { path: "image", message: "Invalid File Format!" },
          ])
        );
      }
      callback(null, true);
    };
    return multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });
  };

  static handleSingleFileUpload = ({
    fieldName,
    validation = [],
    maxFileSize = 512 * 1024,
    storageApproach = StorageTypesEnum.memory,
  }: {
    fieldName: string;
    validation?: string[];
    maxFileSize?: number;
    storageApproach?: StorageTypesEnum;
  }) => {
    return (req: Request, res: Response, next: NextFunction) =>
      this.cloudFileUpload({ validation, maxFileSize, storageApproach }).single(
        fieldName
      )(req, res, function (err) {
        if (err) {
          if (err.code == "LIMIT_FILE_SIZE")
            next(
              new ValidationException("File is too large", [
                { path: fieldName, message: "Invalid Image Size" },
              ])
            );
          else next(err);
        }
        next();
      });
  };
}

export default CloudMulter;
