import type { Request } from "express";
import { generateAlphaNumaricId } from "../security/id.security.ts";

class KeyUtil {
  static generateS3Key = ({
    Path,
    tag,
    originalname,
  }: {
    Path: string;
    tag?: string | undefined;
    originalname: string;
  }): string => {
    return `${process.env.APP_NAME}/${Path}/${generateAlphaNumaricId({
      size: 24,
    })}${tag ? `_${tag}` : ""}_${originalname}`;
  };

  static generateS3KeyFromSubKey = (subKey: string): string => {
    return `${process.env.APP_NAME}/${subKey}`;
  };

  static generateS3SubKey = ({
    Path,
    tag,
    originalname,
  }: {
    Path: string;
    tag?: string | undefined;
    originalname: string;
  }): string => {
    return `${Path}/${generateAlphaNumaricId({
      size: 24,
    })}${tag ? `_${tag}` : ""}_${originalname}`;
  };

  static generateS3UploadsUrlFromSubKey = ({
    req,
    subKey,
  }: {
    req: Request;
    subKey: string;
  }): string => {
    return `${req.protocol}://${req.get(
      "host"
    )}/uploads/${this.generateS3KeyFromSubKey(subKey)}`;
  };
}

export default KeyUtil;
