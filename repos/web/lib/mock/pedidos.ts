export interface PedidoItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: string;
  mesa: number;
  items: PedidoItem[];
  estado: 'recibido' | 'preparando' | 'listo';
  cuentaSolicitada: boolean;
  timestamp: string;
}

export const mockPedidos: Pedido[] = [
  {
    id: 'pedido-1',
    mesa: 2,
    items: [
      { id: 'pi-1', nombre: 'Classic Burger', cantidad: 2, precio: 850 },
      { id: 'pi-2', nombre: 'Papas fritas', cantidad: 2, precio: 450 },
    ],
    estado: 'recibido',
    cuentaSolicitada: false,
    timestamp: '20:15',
  },
  {
    id: 'pedido-2',
    mesa: 4,
    items: [
      { id: 'pi-3', nombre: 'Bacon Burger', cantidad: 1, precio: 1050 },
      { id: 'pi-4', nombre: 'Cerveza artesanal', cantidad: 2, precio: 750 },
    ],
    estado: 'preparando',
    cuentaSolicitada: false,
    timestamp: '20:05',
  },
  {
    id: 'pedido-3',
    mesa: 7,
    items: [
      { id: 'pi-5', nombre: 'Double Smash', cantidad: 3, precio: 1250 },
      { id: 'pi-6', nombre: 'Aros de cebolla', cantidad: 1, precio: 520 },
      { id: 'pi-7', nombre: 'Limonada natural', cantidad: 3, precio: 480 },
    ],
    estado: 'listo',
    cuentaSolicitada: true,
    timestamp: '19:50',
  },
];
