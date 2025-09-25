import { useEffect, useState } from "react";
import type { Employee } from "@/types";
import { getActiveEmployees } from "@/data/employees";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getActiveEmployees();
        if (alive) setEmployees(res);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error al cargar empleados");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { employees, loading, error };
}
