"use client";
import { FC } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import SessionProvider from "@/components/SessionProvider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: FC<ClientProvidersProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
      mutations: {
        onError: (error) => {
          const responseText =
            //@ts-ignore
            error?.response?.statusText || "Something went wrong with the app";
          toast({
            description: responseText,
            variant: "destructive",
            duration: 2000,
          });
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <SessionProvider />
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
};

export default ClientProviders;
