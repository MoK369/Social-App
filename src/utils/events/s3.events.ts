import { EventEmitter } from "node:events";
import CustomEvents from "./custom.event.ts";
import { S3EventsEnum } from "../constants/enum.constants.ts";
import type { IS3UploadPayload } from "../constants/interface.constants.ts";
import S3Service from "../multer/s3.service.ts";
import UserRepository from "../../db/repository/user.respository.ts";
import UserModel from "../../db/models/user.model.ts";
import type { UpdateQuery } from "mongoose";
import type { IUser } from "../../db/interfaces/user.interface.ts";

const s3Events = new CustomEvents<S3EventsEnum, IS3UploadPayload>(
  new EventEmitter()
);
const userRepository = new UserRepository(UserModel);

s3Events.subscribe({
  eventName: S3EventsEnum.trackProfileImageUpload,
  backgroundFunction: async (payload) => {
    console.log("Inside s3 track Profile image upload event");
    setTimeout(async () => {
      try {
        await S3Service.getFile({ SubKey: payload.newSubKey });

        // If file is found, remove tempProfilePicture field and log success
        if (payload.oldSubKey) {
          await S3Service.deleteFile({
            SubKey: payload.oldSubKey,
          });
        }

        await userRepository.updateOne({
          filter: { _id: payload.userId },
          update: {
            $unset: { tempProfilePicture: 1 },
          },
        });
        console.log("Done 👍");
      } catch (e: any) {
        if (e?.code === "NoSuchKey") {
          // If file is not found, revert to previous profile picture
          const toUpdate: UpdateQuery<IUser> = payload?.oldSubKey
            ? {
                $set: {
                  "profilePicture.subKey": payload.oldSubKey,
                },
                $unset: { tempProfilePicture: 1 },
              }
            : {
                $unset: { profilePicture: 1, tempProfilePicture: 1 },
              };

          await userRepository.updateOne({
            filter: { _id: payload.userId },
            update: toUpdate,
          });
          console.log("Reverted to previous profile picture 👌");
        }
      }
    }, (payload.presignedUrlExpiresInSeconds || Number(process.env.AWS_PRESIGNED_URL_EXPIRES_IN_SECONDS)) * 1000 /*In Milli-seconds*/);
  },
});

export default s3Events;
