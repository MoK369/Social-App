import { z } from "zod";
const generalValidationFields = {
    phone: z.string().regex(/^(002|\+2)?01[0125][0-9]{8}$/),
    password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    confirmPasswordChecker: (data, ctx) => {
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "confirmPassword mismatch password",
            });
        }
    },
};
export default generalValidationFields;
