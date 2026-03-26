import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EnacalPage from '@/app/dashboard/enacal/page.jsx';

describe('dashboard/enacal/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('para administrador muestra Reportes y Asignaciones', () => {
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'administrador' }));
    render(<EnacalPage />);

    expect(screen.getByText('Reportes')).toBeInTheDocument();
    expect(screen.getByText('Asignaciones')).toBeInTheDocument();
  });

  it('para director_it muestra Resumen IT y Mapa de Reportes', () => {
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'director_it' }));
    render(<EnacalPage />);

    expect(screen.getByText('Resumen IT')).toBeInTheDocument();
    expect(screen.getByText('Mapa de Reportes')).toBeInTheDocument();
  });
});
