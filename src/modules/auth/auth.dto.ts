import { z } from "zod";
import authValidators from "./auth.validation.ts";

export type SignupDtoType = z.infer<typeof authValidators.signup.body>;
