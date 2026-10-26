import type { Kind } from "@/shared/api/schemas";
import { Badge, type Tone } from "@/shared/ui/Badge";

const tone: Record<Kind, Tone> = { CONCEPT: "accent", QUESTION: "success", EXAMPLE: "warning" };
const label: Record<Kind, string> = { CONCEPT: "Concept", QUESTION: "Question", EXAMPLE: "Example" };

/** What kind of content a section or entry holds. */
export const KindBadge = ({ kind }: { kind: Kind }) => <Badge tone={tone[kind]}>{label[kind]}</Badge>;
