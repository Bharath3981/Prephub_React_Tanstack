import { api } from "@/shared/api/client";
import { parseResponse } from "@/shared/api/parse";
import {
  categoriesDataSchema,
  categoryDetailDataSchema,
  entriesDataSchema,
  entryDataSchema,
  pageMetaSchema,
  type DeliveryCategory,
  type DeliveryCategoryDetail,
  type Difficulty,
  type EntriesPage,
  type EntryDetail,
} from "@/features/catalog/types";

/**
 * All visible categories. These functions know NOTHING about caching: they just ask the API and check the answer.
 * TanStack Query decides when to call them (see queries.ts). The signal lets Query cancel a request nobody waits for.
 */
export async function getCategories(signal?: AbortSignal): Promise<DeliveryCategory[]> {
  const response = await api<unknown>("/delivery/categories", { signal });
  return parseResponse(categoriesDataSchema, response.data).categories;
}

/** One category with its sections. An unknown slug makes the API answer 404 (an ApiRequestError with status 404). */
export async function getCategory(slug: string, signal?: AbortSignal): Promise<DeliveryCategoryDetail> {
  const response = await api<unknown>(`/delivery/categories/${encodeURIComponent(slug)}`, { signal });
  return parseResponse(categoryDetailDataSchema, response.data).category;
}

export interface EntriesQuery {
  page?: number;
  /** 1 to 100. */
  limit?: number;
  difficulty?: Difficulty;
  search?: string;
}

/** The entries of one section (published ones only), one page at a time. Empty values are left out of the URL. */
export async function getEntries(categorySlug: string, sectionSlug: string, query: EntriesQuery = {}, signal?: AbortSignal): Promise<EntriesPage> {
  const path = `/delivery/categories/${encodeURIComponent(categorySlug)}/sections/${encodeURIComponent(sectionSlug)}/entries`;
  const response = await api<unknown>(path, { query: { ...query }, signal });
  return { entries: parseResponse(entriesDataSchema, response.data).entries, meta: parseResponse(pageMetaSchema, response.meta) };
}

/** One entry in full. An unknown slug makes the API answer 404 (an ApiRequestError with status 404). */
export async function getEntry(categorySlug: string, sectionSlug: string, entrySlug: string, signal?: AbortSignal): Promise<EntryDetail> {
  const path = `/delivery/categories/${encodeURIComponent(categorySlug)}/sections/${encodeURIComponent(sectionSlug)}/entries/${encodeURIComponent(entrySlug)}`;
  const response = await api<unknown>(path, { signal });
  return parseResponse(entryDataSchema, response.data).entry;
}
