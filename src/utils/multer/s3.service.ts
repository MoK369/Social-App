import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { Progress } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateAlphaNumaricId } from "../security/id.security.ts";
import { StorageTypesEnum } from "../constants/enum.constants.ts";
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
      throw new BadRequestException("Failed to Retrieve Upload Key");
    }
    return command.input.Key;
  };

  static uploadLargeFile = async ({
    StorageApproach = StorageTypesEnum.disk,
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
    const upload = new Upload({
      client: this.s3Config(),
      params: {
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
      },
    });

    upload.on("httpUploadProgress", (progress: Progress) => {
      console.log("Large Upload File Progress:::", progress);
    });
    const { Key } = await upload.done();
    if (!Key) {
      throw new BadRequestException("Failed to Retrieve Upload Key");
    }
    return Key;
  };

  static createPresignedUploadUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME,
    originalname,
    Path,
    contentType,
    expiresIn = 120,
  }: {
    Bucket?: string;
    originalname: string;
    Path?: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<{ url: string; key: string }> => {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
        size: 32,
      })}_pre_${originalname}`,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3Config(), command, { expiresIn });
    if (!url || !command.input.Key) {
      throw new BadRequestException("Failed to Create Presigned URL");
    }
    return { url, key: command.input.Key };
  };
}

export default S3Service;
