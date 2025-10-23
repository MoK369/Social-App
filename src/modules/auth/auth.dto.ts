import { z } from "zod";
import authValidators from "./auth.validation.ts";

export type SignupBodyDtoType = z.infer<typeof authValidators.signup.body>;

export type ConfirmEmailBodyDtoType = z.infer<
  typeof authValidators.confirmEmail.body
>;
