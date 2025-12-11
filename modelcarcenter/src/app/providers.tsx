'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { ToastViewport } from '@/components/ToastViewport';

interface ProvidersProps {
  children: ReactNode;
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          if (typeof (error as { status?: number })?.status === 'number') {
            const status = (error as { status?: number }).status;
            return status >= 500 || status === 429;
          }
          return true;
        },
        refetchOnWindowFocus: false,
      },
    },
  });

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
