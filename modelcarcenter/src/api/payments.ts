import { apiClient, apiRoutes } from "@/lib/api-client";
import type { PaymentIntent } from "@/types";

export interface CreatePaymentPayload {
  amount: number;
  currency: string;
  account_id?: string;
  metadata?: Record<string, string>;
  idempotency?: string;
  provider?: "stripe";
}

export async function createPaymentIntent(payload: CreatePaymentPayload): Promise<PaymentIntent> {
  return apiClient<PaymentIntent>(apiRoutes.payments.base, {
    method: "POST",
    body: { ...payload, provider: "stripe" },
  });
}

export function getPaymentIntent(paymentId: string) {
  return apiClient<PaymentIntent>(apiRoutes.payments.detail(paymentId), {
    method: "GET",
  });
}
