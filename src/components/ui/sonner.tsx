"use client"

import { Toaster as SonnerToaster } from "sonner"
import type { ToasterProps } from "sonner"

// Wrapper simple para mantener el patrón de shadcn/ui
export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />
}

export default Toaster
