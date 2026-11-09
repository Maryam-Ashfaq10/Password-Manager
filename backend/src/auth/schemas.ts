import { z } from "zod";

// Request validation for the auth endpoints. Both setup and login take just the
// master password; setup is what establishes it for the single user.
export const MasterPasswordInput = z.object({
  masterPassword: z
    .string()
    .min(8, "Master password must be at least 8 characters."),
});

export type MasterPasswordInput = z.infer<typeof MasterPasswordInput>;
