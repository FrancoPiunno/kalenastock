export default function EmptyState({ children }: { children?: React.ReactNode }) {
    return (
      <div className="text-center text-muted-foreground py-10">{children ?? "Sin datos"}</div>
    )
  }
  