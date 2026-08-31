import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ClientesPage from '@/app/dashboard/clientes/page.jsx';

describe('dashboard/clientes/page.jsx', () => {
  it('muestra acciones de buscar y crear reporte', () => {
    render(<ClientesPage />);
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByText('Crear reporte')).toBeInTheDocument();
  });
});
