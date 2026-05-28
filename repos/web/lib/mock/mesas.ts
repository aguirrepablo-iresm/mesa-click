export interface Mesa {
  id: string;
  numero: number;
  token: string;
  estado: 'disponible' | 'ocupada';
}

export const mockMesas: Mesa[] = [
  { id: 'mesa-1', numero: 1, token: 'mesa-token-1', estado: 'disponible' },
  { id: 'mesa-2', numero: 2, token: 'mesa-token-2', estado: 'ocupada' },
  { id: 'mesa-3', numero: 3, token: 'mesa-token-3', estado: 'disponible' },
  { id: 'mesa-4', numero: 4, token: 'mesa-token-4', estado: 'ocupada' },
  { id: 'mesa-5', numero: 5, token: 'mesa-token-5', estado: 'disponible' },
  { id: 'mesa-6', numero: 6, token: 'mesa-token-6', estado: 'disponible' },
  { id: 'mesa-7', numero: 7, token: 'mesa-token-7', estado: 'ocupada' },
  { id: 'mesa-8', numero: 8, token: 'mesa-token-8', estado: 'disponible' },
];
