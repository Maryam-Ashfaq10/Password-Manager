// Shared Zod schemas + types used by both the backend and frontend.
// Filled in during Phase 3 (auth) and Phase 4 (credentials). Kept here so there is
// a single source of truth for request/response shapes.

import { z } from "zod";

// Placeholder so the module is valid until Phase 3/4 populate it.
export const HealthResponse = z.object({
  status: z.string(),
  db: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;
