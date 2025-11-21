import type { Request } from "express";
import { AvailabilityEnum } from "../constants/enum.constants.ts";

export const postFilterBasedOnAvailability = (req: Request) => {
    return [
      { availability: AvailabilityEnum.public },
      {
        availability: AvailabilityEnum.onlyMe,
        createdBy: req.user!._id,
      },
      {
        availability: AvailabilityEnum.friends,
        createdBy: { $in: [...(req.user!.friends || []), req.user!._id] },
      },
      {
        availability: { $ne: AvailabilityEnum.onlyMe },
        tags: { $in: [req.user!.id!] },
      },
    ];
  }