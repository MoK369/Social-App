import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, ObjectCannedACL, } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StorageTypesEnum } from "../constants/enum.constants.js";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../exceptions/custom.exceptions.js";
import KeyUtil from "./key.multer.js";
class S3Service {
    static _s3ClientObject = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
    static uploadFile = async ({ StorageApproach = StorageTypesEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", File, }) => {
        const subKey = KeyUtil.generateS3SubKey({
            Path,
            originalname: File.originalname,
        });
        const command = new PutObjectCommand({
            Bucket,
            ACL,
            Key: KeyUtil.generateS3KeyFromSubKey(subKey),
            Body: StorageApproach === StorageTypesEnum.memory
                ? File.buffer
                : createReadStream(File.path),
            ContentType: File.mimetype,
        });
        await this._s3ClientObject.send(command).catch((error) => {
            throw new BadRequestException(`Failed to upload file ☹️ Error: ${error.message}`);
        });
        if (!command.input.Key) {
            throw new BadRequestException("Failed to Retrieve Upload Key");
        }
        return subKey;
    };
    static uploadLargeFile = async ({ StorageApproach = StorageTypesEnum.disk, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", Path = "general", File, }) => {
        const subKey = KeyUtil.generateS3SubKey({
            Path,
            originalname: File.originalname,
        });
        const upload = new Upload({
            client: this._s3ClientObject,
            params: {
                Bucket,
                ACL,
                Key: KeyUtil.generateS3KeyFromSubKey(subKey),
                Body: StorageApproach === StorageTypesEnum.memory
                    ? File.buffer
                    : createReadStream(File.path),
                ContentType: File.mimetype,
            },
        });
        upload.on("httpUploadProgress", (progress) => {
            console.log("Large Upload File Progress:::", progress);
        });
        upload.done().catch((error) => {
            throw new BadRequestException(`Failed to upload file ☹️ Error: ${error.message}`);
        });
        const { Key } = await upload.done();
        if (!Key) {
            throw new BadRequestException("Failed to Retrieve Upload Key");
        }
        return subKey;
    };
    static createPresignedUploadUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, originalname, Path = "general", contentType, expiresIn = 120, }) => {
        const subKey = KeyUtil.generateS3SubKey({
            Path,
            tag: "presigned",
            originalname,
        });
        const command = new PutObjectCommand({
            Bucket,
            Key: KeyUtil.generateS3KeyFromSubKey(subKey),
            ContentType: contentType,
        });
        const url = await getSignedUrl(this._s3ClientObject, command, {
            expiresIn,
        }).catch((error) => {
            throw new BadRequestException(`Failed to create presigned upload url ☹️ Error: ${error.message}`);
        });
        if (!url || !command.input.Key) {
            throw new BadRequestException("Failed to Create Presigned URL");
        }
        return { url, key: subKey };
    };
    static createPresignedGetUrl = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, expiresIn = 120, download = "false", downloadName, }) => {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true"
                ? `attachment; filename="${downloadName
                    ? `${downloadName}.${Key.split(".").pop() ?? ""}`
                    : Key.split("/").pop()}"`
                : undefined,
        });
        const url = await getSignedUrl(this._s3ClientObject, command, {
            expiresIn,
        }).catch((error) => {
            throw new BadRequestException(`Failed to create presigned get url ☹️ Error: ${error.message}`);
        });
        if (!url || !command.input.Key) {
            throw new BadRequestException("Failed to Create Presigned URL");
        }
        return url;
    };
    static getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
        const command = new GetObjectCommand({
            Bucket,
            Key,
        });
        return this._s3ClientObject.send(command).catch((error) => {
            throw new BadRequestException(`Failed to fetch this asset ☹️ Error: ${error.message}`);
        });
    };
    static deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
        const command = new DeleteObjectCommand({
            Bucket,
            Key,
        });
        return this._s3ClientObject.send(command).catch((error) => {
            throw new BadRequestException(`Failed to delete this asset ☹️ Error: ${error.message}`);
        });
    };
    static deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, Keys, Quiet, }) => {
        const Objects = Keys.map((Key) => {
            return { Key };
        });
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet,
            },
        });
        return this._s3ClientObject.send(command).catch((error) => {
            throw new BadRequestException(`Failed to delete these assets ☹️ Error: ${error.message}`);
        });
    };
    static listDirectoryFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, FolderPath, }) => {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: KeyUtil.generateS3KeyFromSubKey(FolderPath),
        });
        const result = await this._s3ClientObject.send(command).catch((error) => {
            throw new BadRequestException(`Failed to list files in this directory ☹️ Error: ${error.message}`);
        });
        if (!result.Contents || result.Contents.length === 0) {
            throw new BadRequestException("No files found in this directory ☹️");
        }
        return result;
    };
    static deleteFolderByPrefix = async ({ Bucket = process.env.AWS_BUCKET_NAME, FolderPath, Quiet, }) => {
        const listedObjects = await this.listDirectoryFiles({
            Bucket,
            FolderPath,
        });
        const Keys = listedObjects.Contents.map((item) => item.Key);
        return this.deleteFiles({ Bucket, Keys, Quiet });
    };
}
export default S3Service;
