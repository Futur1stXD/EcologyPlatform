import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastState {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "error", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "info", title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().add({ type: "warning", title, description }),
};
