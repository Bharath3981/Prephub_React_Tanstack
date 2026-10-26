import { ApiRequestError } from "@/shared/api/client";

/** The API answered 404 (an unknown topic, section or entry): show the not-found page, not a generic error with "Try again". */
export const isNotFound = (error: unknown) => error instanceof ApiRequestError && error.status === 404;
