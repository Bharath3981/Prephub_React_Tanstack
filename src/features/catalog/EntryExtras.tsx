import { EntryLink } from "@/features/catalog/EntryLink";
import type { EntryDetail } from "@/features/catalog/types";
import { TagChip } from "@/shared/ui/TagChip";

/** Facts that depend on the kind of entry, taken from its `meta`. */
function KindMeta({ entry }: { entry: EntryDetail }) {
  const { followUps, scenario, language } = entry.meta;

  if (entry.kind === "QUESTION" && followUps && followUps.length > 0) {
    return (
      <aside aria-labelledby="follow-ups-heading" className="rounded-xl border border-border bg-surface p-5">
        <h2 id="follow-ups-heading" className="font-semibold">
          Follow-up questions to expect
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {followUps.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </aside>
    );
  }

  if (entry.kind === "EXAMPLE" && (scenario || language)) {
    return (
      <aside className="space-y-1 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
        {scenario && (
          <p>
            <strong className="text-foreground">Scenario:</strong> {scenario}
          </p>
        )}
        {language && (
          <p>
            <strong className="text-foreground">Language:</strong> {language}
          </p>
        )}
      </aside>
    );
  }

  return null;
}

/**
 * What comes after the body of an entry: follow-up questions (or an example's scenario), the tags as links, and related
 * entries. Each part shows only when the entry has it.
 */
export function EntryExtras({ entry }: { entry: EntryDetail }) {
  return (
    <>
      <KindMeta entry={entry} />

      {entry.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {entry.tags.map((tag) => (
            <li key={tag.slug}>
              <TagChip tag={tag} />
            </li>
          ))}
        </ul>
      )}

      {entry.related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-border pt-6">
          <h2 id="related-heading" className="font-semibold">
            Related
          </h2>
          <ul className="mt-3 space-y-2">
            {entry.related.map((related) => (
              <li key={`${related.categorySlug}/${related.sectionSlug}/${related.slug}`}>
                <EntryLink categorySlug={related.categorySlug} sectionSlug={related.sectionSlug} slug={related.slug} className="text-accent hover:underline">
                  {related.title}
                </EntryLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
