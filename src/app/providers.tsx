// src/app/providers.tsx
import { type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "react-error-boundary"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ErrorBoundary fallback={<div className="p-4">Ocurrió un error.</div>}>
        {children}
      </ErrorBoundary>
      <Toaster richColors position="top-center" />
    </>
  )
}
