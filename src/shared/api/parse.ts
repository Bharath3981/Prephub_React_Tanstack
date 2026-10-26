import type { ZodType } from "zod";
import { ApiRequestError } from "@/shared/api/client";

/**
 * Checks that data from the server has the shape we expect, and returns it typed.
 * TypeScript types disappear at run time and a server can change, so this is the one place where "we think it is a
 * category" becomes "we checked that it is a category". A wrong shape becomes a normal ApiRequestError.
 */
export function parseResponse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiRequestError(0, "BAD_RESPONSE", "The server sent data in an unexpected shape", result.error.issues);
  }
  return result.data;
}
