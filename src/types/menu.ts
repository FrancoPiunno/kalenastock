import type { ReactNode } from "react"
export type MenuOptionKey = "stock" | "add" | "remove" | (string & {})
export type MenuOption = { key: MenuOptionKey; label: string; description?: string; icon?: ReactNode }
