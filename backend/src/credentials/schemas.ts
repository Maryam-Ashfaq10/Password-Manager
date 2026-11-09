import { z } from "zod";

// Validation for credential endpoints.
// website + username + password are required to create an entry;
// url and notes are optional. website/username are stored in plaintext
// (so they're searchable); password/notes get encrypted before storage.

export const CreateCredentialInput = z.object({
  website: z.string().min(1, "Website is required."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  url: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateCredentialInput = z.infer<typeof CreateCredentialInput>;

// Update is a partial patch: any subset of fields may be provided.
// A provided empty-string `notes` clears the note.
export const UpdateCredentialInput = z
  .object({
    website: z.string().min(1, "Website cannot be empty.").optional(),
    username: z.string().min(1, "Username cannot be empty.").optional(),
    password: z.string().min(1, "Password cannot be empty.").optional(),
    url: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update.",
  });
export type UpdateCredentialInput = z.infer<typeof UpdateCredentialInput>;

export const SearchQuery = z.object({
  q: z.string().optional(),
});
