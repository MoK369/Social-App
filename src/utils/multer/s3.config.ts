import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { generateAlphaNumaricId } from "../security/id.security.ts";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../exceptions/custom.exceptions.ts";

class S3Service {
  static s3Config = () => {
    return new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  };

  static uploadFile = async ({
    StorageApproach = StorageTypesEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME,
    ACL = "private",
    Path = "general",
    File,
  }: {
    StorageApproach?: StorageTypesEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    Path?: string;
    File: Express.Multer.File;
  }): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
        size: 32,
      })}_${File.originalname}`,
      Body:
        StorageApproach === StorageTypesEnum.memory
          ? File.buffer
          : createReadStream(File.path),
      ContentType: File.mimetype,
    });

    await this.s3Config().send(command);
    if (!command.input.Key) {
      throw new BadRequestException("failed to retrieve upload key");
    }
    return command.input.Key;
  };
}

export default S3Service;
