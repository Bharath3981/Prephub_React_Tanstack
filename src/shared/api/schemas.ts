import { z } from "zod";

/** Pieces of the API's data that more than one feature uses. */
export const kindSchema = z.enum(["CONCEPT", "QUESTION", "EXAMPLE"]);
export type Kind = z.infer<typeof kindSchema>;
