// Representación conceptual de almacenamiento en memoria

// Orientado a filas (OLTP):
export const rowOriented = [
  { id: 1, user: 'Alice', total: 150.00, date: '2026-10-01' },
  { id: 2, user: 'Bob', total: 200.50, date: '2026-10-02' },
  { id: 3, user: 'Carol', total: 85.20, date: '2026-10-02' }
];

// Orientado a columnas (OLAP / Columnar):
export const columnOriented = {
  id: [1, 2, 3],
  user: ['Alice', 'Bob', 'Carol'],
  total: [150.00, 200.50, 85.20],
  date: ['2026-10-01', '2026-10-02', '2026-10-02']
};

// En OLAP, calcular el total gastado lee únicamente el vector 'total':
export const sumTotal = columnOriented.total.reduce((acc, val) => acc + val, 0);
