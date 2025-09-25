export default function Page({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-dvh bg-background text-foreground px-4 py-6 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </div>
    )
  }