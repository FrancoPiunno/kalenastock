import { Card } from "@/components/ui/card"
export default function SectionCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <Card className={`shadow-md ${className}`}>{children}</Card>
}