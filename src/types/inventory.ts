/** Producto / Insumo del inventario */
export type Item = {
  id: string;               // id del doc en Firestore
  nombre: string;           // nombre del insumo
  stockMin: number;         // mínimo deseado
  stockActual: number;      // stock actual (denormalizado)
  activo: boolean;          // baja lógica
  createdAt?: Date;         // opcional (serverTimestamp mapeado)
};

/** Tipos de movimiento */
export type MovementType = "INGRESO" | "EGRESO";

/** Registro de movimiento de stock */
export type Movement = {
  id: string;               // id del doc
  itemId: string;           // referencia al Item
  tipo: MovementType;       // ingreso o egreso
  cantidad: number;         // cantidad movida
  responsable: string;      // nombre de quien retira/ingresa
  nota?: string;            // opcional
  ts: Date;                 // fecha/hora (serverTimestamp)
};
