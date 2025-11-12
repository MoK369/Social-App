import { EventEmitter } from "node:events";
import CustomEvents from "./custom.event.js";
import { S3EventsEnum } from "../constants/enum.constants.js";
import S3Service from "../multer/s3.service.js";
import UserRepository from "../../db/repository/user.respository.js";
import { UserModel } from "../../db/models/user.model.js";
const s3Events = new CustomEvents(new EventEmitter());
const userRepository = new UserRepository(UserModel);
s3Events.subscribe({
    eventName: S3EventsEnum.trackProfileImageUpload,
    backgroundFunction: async (payload) => {
        console.log("Inside s3 track Profile image upload event");
        setTimeout(async () => {
            try {
                await S3Service.getFile({ SubKey: payload.newSubKey });
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
            }
            catch (e) {
                if (e?.code === "NoSuchKey") {
                    const toUpdate = payload?.oldSubKey
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
        }, (payload.presignedUrlExpiresInSeconds || Number(process.env.AWS_PRESIGNED_URL_EXPIRES_IN_SECONDS)) * 1000);
    },
});
export default s3Events;
