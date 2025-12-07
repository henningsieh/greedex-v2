"use client";

import { Loader2Icon } from "lucide-react";
import * as React from "react";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean, message?: string) => void;
  loadingMessage?: string | undefined;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(
  undefined,
);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState<string | undefined>(
    undefined,
  );

  const setAppLoading = React.useCallback(
    (loading: boolean, message?: string) => {
      setIsLoading(loading);
      if (loading) {
        if (typeof message !== "undefined") {
          setLoadingMessage(message);
        }
      } else {
        setLoadingMessage(undefined);
      }
    },
    [],
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isLoading,
        setIsLoading: setAppLoading,
        loadingMessage,
      }}
    >
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-accent/50 p-8 shadow-lg">
            <Loader2Icon className="size-12 animate-spin text-primary" />
            <p className="font-medium text-lg">
              {loadingMessage ?? "Switching organization..."}
            </p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useAppLoading(defaultMessage?: string) {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error("useAppLoading must be used within LoadingProvider");
  }

  const { isLoading, setIsLoading } = context;

  const setIsLoadingWithDefault = React.useCallback(
    (loading: boolean, message?: string) => {
      setIsLoading(
        loading,
        typeof message === "undefined" ? defaultMessage : message,
      );
    },
    [setIsLoading, defaultMessage],
  );

  return {
    isLoading,
    setIsLoading: setIsLoadingWithDefault,
  } as const;
}
