"use client";

import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useState } from "react";

import { cn } from "@/lib/utils";

type LoadingMode = "project" | "organization";

const getModeStyles = (mode?: LoadingMode) => {
  switch (mode) {
    case "project":
      return {
        containerClassName: `border-2 border-secondary bg-secondary/20`,
        textColor: "text-secondary",
      };
    case "organization":
      return {
        containerClassName: `border-2 border-accent bg-accent/20`,
        textColor: "text-accent",
      };
    default:
      return {
        containerClassName: "",
        textColor: "text-primary",
      };
  }
};

interface LoadingState {
  isLoading: boolean;
  message?: string;
  mode?: LoadingMode;
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (_: Partial<LoadingState>) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("app.loading");
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
  });

  const setLoading = useCallback((updates: Partial<LoadingState>) => {
    setLoadingState((prev) => ({ ...prev, ...updates }));
  }, []);

  const modeStyles = getModeStyles(loadingState.mode);

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        setLoading,
      }}
    >
      {children}
      {loadingState.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div
            className={cn(
              "flex flex-col items-center gap-4 rounded-lg bg-accent/50 p-8 shadow-lg",
              modeStyles.containerClassName,
            )}
          >
            <Loader2Icon
              className={cn("size-12 animate-spin", modeStyles.textColor)}
            />
            <p className="text-lg font-medium">
              {loadingState.message ?? t("default")}
            </p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useAppLoading(options?: {
  message?: string;
  mode?: "project" | "organization";
}) {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error(`useAppLoading must be used within LoadingProvider`);
  }

  const { loadingState, setLoading } = context;

  return {
    isLoading: loadingState.isLoading,
    startLoading: () =>
      setLoading({
        isLoading: true,
        message: options?.message,
        mode: options?.mode,
      }),
    stopLoading: () => setLoading({ isLoading: false }),
  } as const;
}
