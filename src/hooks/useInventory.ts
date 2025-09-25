import { useEffect, useState } from "react";
import type { Item, Movement } from "@/types";
import { getActiveItems, getLastMovements } from "@/data/inventory";

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [movs, setMovs] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setLoading(true);
    try {
      const [i, m] = await Promise.all([getActiveItems(), getLastMovements(50)]);
      setItems(i);
      setMovs(m);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error de carga");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refetch(); }, []);

  return { items, movs, loading, error, refetch };
}
