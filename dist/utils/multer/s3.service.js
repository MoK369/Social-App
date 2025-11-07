import { S3Client, PutObjectCommand, GetObjectCommand, ObjectCannedACL, } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateAlphaNumaricId } from "../security/id.security.js";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../exceptions/custom.exceptions.js";
class S3Service {
    static _s3ClientObject = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    static uploadFile = async ({ StorageApproach = StorageTypesEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", File, }) => {
        const command = new PutObjectCommand({
            Bucket,
            ACL,
            Key: `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
                size: 32,
            })}_${File.originalname}`,
            Body: StorageApproach === StorageTypesEnum.memory
                ? File.buffer
                : createReadStream(File.path),
            ContentType: File.mimetype,
        });
        await this._s3ClientObject.send(command);
        if (!command.input.Key) {
            throw new BadRequestException("Failed to Retrieve Upload Key");
        }
        return command.input.Key;
    };
    static uploadLargeFile = async ({ StorageApproach = StorageTypesEnum.disk, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", File, }) => {
        const upload = new Upload({
            client: this._s3ClientObject,
            params: {
                Bucket,
                ACL,
                Key: `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
                    size: 32,
                })}_${File.originalname}`,
                Body: StorageApproach === StorageTypesEnum.memory
                    ? File.buffer
                    : createReadStream(File.path),
                ContentType: File.mimetype,
            },
        });
        upload.on("httpUploadProgress", (progress) => {
            console.log("Large Upload File Progress:::", progress);
        });
        const { Key } = await upload.done();
        if (!Key) {
            throw new BadRequestException("Failed to Retrieve Upload Key");
        }
        return Key;
    };
    static createPresignedUploadUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, originalname, Path, contentType, expiresIn = 120, }) => {
        const command = new PutObjectCommand({
            Bucket,
            Key: `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
                size: 32,
            })}_pre_${originalname}`,
            ContentType: contentType,
        });
        const url = await getSignedUrl(this._s3ClientObject, command, {
            expiresIn,
        });
        if (!url || !command.input.Key) {
            throw new BadRequestException("Failed to Create Presigned URL");
        }
        return { url, key: command.input.Key };
    };
    static getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
        const command = new GetObjectCommand({
            Bucket,
            Key,
        });
        return this._s3ClientObject.send(command);
    };
}
export default S3Service;
