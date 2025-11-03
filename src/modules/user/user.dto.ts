import type z from "zod";
import type UserValidation from "./user.validation.ts";

export type LogoutBodyTypeDto = z.infer<typeof UserValidation.logout.body>;
