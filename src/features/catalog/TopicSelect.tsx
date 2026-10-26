import type { DeliveryCategory } from "@/features/catalog/types";

/** "All topics" or one topic, as a native select (keyboard and screen reader support for free). `value` is a category slug. */
export function TopicSelect({ topics, value, onChange }: { topics: DeliveryCategory[]; value: string | undefined; onChange: (slug: string | undefined) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Topic</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="h-8 rounded-lg border border-border bg-surface px-2 text-sm focus:border-accent focus:outline-none"
      >
        <option value="">All topics</option>
        {topics.map((topic) => (
          <option key={topic.slug} value={topic.slug}>
            {topic.name}
          </option>
        ))}
      </select>
    </label>
  );
}
