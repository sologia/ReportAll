import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EnacalPage from '@/app/dashboard/enacal/page.jsx';

describe('dashboard/enacal/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = 'reportall_session=; Path=/; Max-Age=0';
    document.cookie = 'reportall_token=; Path=/; Max-Age=0';
    localStorage.clear();
  });

  it('para administrador muestra sus accesos principales', () => {
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'administrador' }));
    render(<EnacalPage />);

    expect(screen.getByText('Ver todos los reportes')).toBeInTheDocument();
    expect(screen.getByText('Gestionar asignaciones')).toBeInTheDocument();
  });

  it('para director_it muestra el mismo menu visual base con sus accesos permitidos', () => {
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'director_it' }));
    render(<EnacalPage />);

    expect(screen.getByText('Ver mapa de reportes')).toBeInTheDocument();
    expect(screen.getByText('Ver resumen IT')).toBeInTheDocument();
    expect(screen.getByText('Ver estadisticas')).toBeInTheDocument();
    expect(screen.getByText('Ver resumen por cuadrilla')).toBeInTheDocument();
  });
});
