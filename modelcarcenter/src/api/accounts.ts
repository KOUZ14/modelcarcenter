import { apiClient, apiRoutes } from "@/lib/api-client";
import type { AccountDetail, AccountSummary, AccountType } from "@/types";

export interface CreateAccountPayload {
  name: string;
  email: string;
  type: AccountType;
}

const normalizeAccount = <T extends { account_type?: string; type?: AccountType }>(account: T) => ({
  ...account,
  type: (account.account_type ?? account.type) as AccountType,
});

export async function createAccount(payload: CreateAccountPayload): Promise<AccountSummary> {
  const response = await apiClient<{ account: AccountSummary } | AccountSummary>(apiRoutes.accounts.base, {
    method: "POST",
    body: {
      name: payload.name,
      email: payload.email,
      account_type: payload.type,
    },
  });

  if ("account" in (response as Record<string, unknown>)) {
    return normalizeAccount((response as { account: AccountSummary }).account);
  }

  return normalizeAccount(response as AccountSummary);
}

export async function listAccounts(): Promise<AccountSummary[]> {
  const response = await apiClient<{ accounts: AccountSummary[] } | AccountSummary[]>(apiRoutes.accounts.base, {
    method: "GET",
  });

  if (Array.isArray(response)) {
    return response.map(normalizeAccount);
  }

  return (response.accounts ?? []).map(normalizeAccount);
}

export async function getAccountDetail(accountId: string): Promise<AccountDetail> {
  const response = await apiClient<AccountDetail>(apiRoutes.accounts.detail(accountId), {
    method: "GET",
    query: { include_listings: "true" },
  });

  const detail = normalizeAccount(response) as AccountDetail;

  if (!("listings" in detail)) {
    return { ...detail, listings: [] };
  }

  return {
    ...detail,
    listings: detail.listings ?? [],
  };
}
