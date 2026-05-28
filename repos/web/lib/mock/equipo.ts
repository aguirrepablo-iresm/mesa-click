export interface UsuarioEquipo {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'encargado' | 'mozo';
  estado: 'activo' | 'invitado';
}

export const mockEquipo: UsuarioEquipo[] = [
  { id: 'u-1', nombre: 'Pablo Aguirre', email: 'pablo@mesaclick.com', rol: 'admin', estado: 'activo' },
  { id: 'u-2', nombre: 'Martín Oviedo', email: 'martin@mesaclick.com', rol: 'encargado', estado: 'activo' },
  { id: 'u-3', nombre: 'Mateo Silvestrin', email: 'mateo@mesaclick.com', rol: 'mozo', estado: 'invitado' },
];
