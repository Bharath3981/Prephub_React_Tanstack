import { Badge, type Tone } from "@/shared/ui/Badge";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const tone: Record<Difficulty, Tone> = { EASY: "success", MEDIUM: "warning", HARD: "danger" };
const label: Record<Difficulty, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => <Badge tone={tone[difficulty]}>{label[difficulty]}</Badge>;
