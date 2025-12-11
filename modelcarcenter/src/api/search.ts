import { apiClient, apiRoutes } from "@/lib/api-client";
import type { SearchResult } from "@/types";

export async function searchMarketplace(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  const response = await apiClient<SearchResult[] | { results: SearchResult[] }>(apiRoutes.search(query), {
    method: "GET",
  });

  if (Array.isArray(response)) {
    return response;
  }

  return response.results ?? [];
}
