/** Development only (see router.tsx): throws while rendering, to show what the error boundaries do. */
export function DevBoomPage(): never {
  throw new Error("Boom: this error was thrown on purpose while rendering /dev/boom");
}
