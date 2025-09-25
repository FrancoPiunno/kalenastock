import { useEffect, useState } from "react";
import { onSnapshot, query, where, orderBy, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Item } from "@/types";

export function useItemsLive() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const q = query(collection(db, "items"), where("activo", "==", true), orderBy("nombre"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Item, "id">) })));
    });
    return () => unsub();
  }, []);

  return items;
}
