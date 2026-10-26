import { describe, expect, it } from "vitest";
import { ApiRequestError } from "@/shared/api/client";
import { queryClient } from "@/shared/api/query-client";

// The app's retry rule, called the way TanStack Query calls it: retry(failureCount, error).
const retry = queryClient.getDefaultOptions().queries!.retry as (failureCount: number, error: unknown) => boolean;

describe("the retry rule", () => {
  it("does not retry a 4xx answer: the same request would get the same answer", () => {
    expect(retry(0, new ApiRequestError(404, "NOT_FOUND", "x"))).toBe(false);
    expect(retry(0, new ApiRequestError(422, "VALIDATION_ERROR", "x"))).toBe(false);
  });

  it("retries a server error or a network failure, at most twice", () => {
    expect(retry(0, new ApiRequestError(500, "INTERNAL", "x"))).toBe(true);
    expect(retry(1, new ApiRequestError(0, "NETWORK", "x"))).toBe(true);
    expect(retry(2, new ApiRequestError(500, "INTERNAL", "x"))).toBe(false);
  });
});
