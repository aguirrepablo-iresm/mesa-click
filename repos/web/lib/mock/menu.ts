export interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  items: MenuItem[];
}

export const mockMenu: Categoria[] = [
  {
    id: 'cat-1',
    nombre: 'Hamburguesas',
    items: [
      { id: 'item-1', nombre: 'Classic Burger', descripcion: 'Carne 200g, lechuga, tomate, cheddar', precio: 850, disponible: true },
      { id: 'item-2', nombre: 'Bacon Burger', descripcion: 'Carne 200g, bacon crocante, cebolla caramelizada', precio: 1050, disponible: true },
      { id: 'item-3', nombre: 'Veggie Burger', descripcion: 'Medallón de garbanzo, aguacate, rúcula', precio: 920, disponible: false },
      { id: 'item-4', nombre: 'Double Smash', descripcion: 'Dos medallones 120g, doble cheddar, salsa especial', precio: 1250, disponible: true },
    ],
  },
  {
    id: 'cat-2',
    nombre: 'Entradas',
    items: [
      { id: 'item-5', nombre: 'Papas fritas', descripcion: 'Porción grande con sal y pimentón', precio: 450, disponible: true },
      { id: 'item-6', nombre: 'Aros de cebolla', descripcion: 'Rebozados con salsa BBQ', precio: 520, disponible: true },
      { id: 'item-7', nombre: 'Nachos', descripcion: 'Con queso fundido, jalapeños y guacamole', precio: 680, disponible: true },
    ],
  },
  {
    id: 'cat-3',
    nombre: 'Bebidas',
    items: [
      { id: 'item-8', nombre: 'Gaseosa 500ml', descripcion: 'Coca-Cola, Sprite o Fanta', precio: 350, disponible: true },
      { id: 'item-9', nombre: 'Agua mineral', descripcion: 'Con o sin gas, 500ml', precio: 250, disponible: true },
      { id: 'item-10', nombre: 'Limonada natural', descripcion: 'Exprimida al momento, con menta', precio: 480, disponible: true },
      { id: 'item-11', nombre: 'Cerveza artesanal', descripcion: 'IPA o Stout, 473ml', precio: 750, disponible: true },
    ],
  },
];
