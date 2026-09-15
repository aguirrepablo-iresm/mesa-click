export interface ConsumoIdentificado {
  cantidad: number;
  precio: number;
  comensalId?: string;
  comensalNombre?: string;
}

export interface GrupoComensal<T extends ConsumoIdentificado> {
  id: string;
  nombre: string;
  etiqueta: string;
  items: T[];
  subtotal: number;
}

export function agruparPorComensal<T extends ConsumoIdentificado>(items: T[]): GrupoComensal<T>[] {
  const grupos = new Map<string, Omit<GrupoComensal<T>, "etiqueta">>();

  items.forEach(item => {
    const id = item.comensalId?.trim() || "mesa-sin-identificar";
    const nombre = item.comensalNombre?.trim() || "Mesa";
    const existente = grupos.get(id);
    if (existente) {
      existente.nombre = nombre;
      existente.items.push(item);
      existente.subtotal += item.precio * item.cantidad;
      return;
    }

    grupos.set(id, {
      id,
      nombre,
      items: [item],
      subtotal: item.precio * item.cantidad,
    });
  });

  const lista = Array.from(grupos.values());
  const cantidadesPorNombre = new Map<string, number>();
  lista.forEach(grupo => {
    const key = grupo.nombre.toLocaleLowerCase("es");
    cantidadesPorNombre.set(key, (cantidadesPorNombre.get(key) ?? 0) + 1);
  });

  return lista.map(grupo => {
    const key = grupo.nombre.toLocaleLowerCase("es");
    const repetido = (cantidadesPorNombre.get(key) ?? 0) > 1;
    const identificadorCorto = grupo.id.slice(0, 6).toUpperCase();

    return {
      ...grupo,
      etiqueta: repetido ? `${grupo.nombre} · ${identificadorCorto}` : grupo.nombre,
    };
  });
}
