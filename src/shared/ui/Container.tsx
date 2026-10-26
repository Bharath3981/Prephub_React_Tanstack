import type { ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Centres content and limits its width. `as` lets the same layout code render a <header>, <main> or <div>
 * without an extra wrapper element.
 */
export function Container({ as: Tag = "div", className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  return <Tag className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</Tag>;
}
