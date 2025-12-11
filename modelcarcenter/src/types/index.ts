export type AccountType = "collector" | "shop";

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status?: string;
  quantity?: number;
  image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  email: string;
  type: AccountType;
  created_at?: string;
  stats?: {
    listing_count?: number;
    total_inventory_value?: number;
  };
}

export interface AccountDetail extends AccountSummary {
  listings: Listing[];
}

export interface SearchResult {
  id?: string;
  title: string;
  price: number;
  price_currency?: string;
  image_url?: string;
  url: string;
  seller?: string;
}

export interface PaymentIntent {
  id: string;
  provider: "stripe";
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  account_id?: string;
  metadata?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface ApiError {
  status?: number;
  message: string;
  details?: unknown;
}
