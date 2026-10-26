import type { EntrySummary } from "@/features/catalog/types";

export interface NavItem {
  slug: string;
  title: string;
}

export interface NavGroup {
  /** The heading as the API names it ("4. Hooks"), or null when the section has no headings at all. */
  heading: string | null;
  items: NavItem[];
}

/**
 * Entries under their heading, in the order the headings first appear. Entries without a heading come first as "General"
 * (or with no heading at all when nothing in the section has one).
 */
export function navGroups(entries: EntrySummary[]): NavGroup[] {
  const named = new Map<string, NavGroup["items"]>();
  const general: NavGroup["items"] = [];
  for (const { group, slug, title } of entries) {
    if (!group) general.push({ slug, title });
    else named.set(group, [...(named.get(group) ?? []), { slug, title }]);
  }
  const groups: NavGroup[] = [...named].map(([heading, items]) => ({ heading, items }));
  if (general.length > 0) groups.unshift({ heading: named.size > 0 ? "General" : null, items: general });
  return groups;
}
