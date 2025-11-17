import { AvailabilityEnum } from "../constants/enum.constants.js";
export const postFilterBasedOnAvailability = (req) => {
    return [
        { availability: AvailabilityEnum.public },
        {
            availability: AvailabilityEnum.onlyMe,
            createdBy: req.user._id,
        },
        {
            availability: AvailabilityEnum.friends,
            createdBy: { $in: [...(req.user.friends || []), req.user._id] },
        },
        {
            availability: { $ne: AvailabilityEnum.onlyMe },
            tags: { $in: req.user.id },
        },
    ];
};
