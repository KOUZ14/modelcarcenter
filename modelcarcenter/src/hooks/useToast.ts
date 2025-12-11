import { useCallback } from "react";
import { useToastStore, type ToastItem } from "@/store/toast-store";

type ToastInput = Omit<ToastItem, "id"> & { id?: string };

export function useToast() {
  const push = useToastStore((state) => state.push);
  const dismiss = useToastStore((state) => state.dismiss);

  const showToast = useCallback((toast: ToastInput) => push(toast), [push]);

  return {
    toast: showToast,
    dismiss,
  };
}
