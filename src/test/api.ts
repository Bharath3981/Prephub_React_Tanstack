import { http, HttpResponse } from "msw";

/** The test origin plus the API prefix: handlers are written with the path the app uses, "/delivery/categories". */
export const api = (path: string) => `http://localhost/api/v1${path}`;

/** The API's success envelope. */
export const ok = <T,>(data: T, meta?: unknown) => HttpResponse.json({ success: true, data, ...(meta ? { meta } : {}) });

/** The API's failure envelope. */
export const fail = (status: number, code: string, message: string) => HttpResponse.json({ success: false, error: { code, message } }, { status });

export { http, HttpResponse };
