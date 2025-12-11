import { apiClient, apiRoutes } from "@/lib/api-client";
import type { Listing } from "@/types";

export interface ListingPayload {
  title: string;
  price: number;
  currency: string;
  status?: string;
  quantity?: number;
  image_url?: string;
  description?: string;
}

const normalizeListing = (listing: Listing): Listing => ({
  ...listing,
  price: typeof listing.price === "number" ? listing.price : Number(listing.price),
});

export async function listListings(accountId: string): Promise<Listing[]> {
  const response = await apiClient<{ listings: Listing[] } | Listing[]>(apiRoutes.accounts.listings(accountId), {
    method: "GET",
  });

  if (Array.isArray(response)) {
    return response.map(normalizeListing);
  }

  return (response.listings ?? []).map(normalizeListing);
}

export async function createListing(accountId: string, payload: ListingPayload): Promise<Listing> {
  const listing = await apiClient<Listing>(apiRoutes.accounts.listings(accountId), {
    method: "POST",
    body: payload,
  });

  return normalizeListing(listing);
}

export async function updateListing(accountId: string, listingId: string, payload: Partial<ListingPayload>): Promise<Listing> {
  const listing = await apiClient<Listing>(apiRoutes.accounts.listingDetail(accountId, listingId), {
    method: "PATCH",
    body: payload,
  });

  return normalizeListing(listing);
}

export async function deleteListing(accountId: string, listingId: string): Promise<void> {
  await apiClient(apiRoutes.accounts.listingDetail(accountId, listingId), {
    method: "DELETE",
  });
}
