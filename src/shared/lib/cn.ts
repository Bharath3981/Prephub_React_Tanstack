/** Joins class names and skips the falsy ones: cn("a", cond && "b", undefined) gives "a b" or "a". */
export const cn = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(" ");
