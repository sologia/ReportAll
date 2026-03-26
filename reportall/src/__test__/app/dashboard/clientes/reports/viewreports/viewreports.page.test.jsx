import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import ViewReportClient from '@/app/dashboard/clientes/reports/viewreports/page.jsx';
import Swal from 'sweetalert2';

const replaceMock = jest.fn();

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
    back: jest.fn(),
  }),
}));

describe('dashboard/clientes/reports/viewreports/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({ json: async () => [] });
  });

  it('muestra alerta si no hay clientId en la sesión', async () => {
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'cliente', clientId: null }));

    render(<ViewReportClient />);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Perfil incompleto',
        text: 'No se encontró el identificador de cliente para cargar tus reportes.',
        confirmButtonText: 'Aceptar',
      });
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('redirige a login si no hay sesión', async () => {
    localStorage.removeItem('reportall_session');

    render(<ViewReportClient />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/auth/login');
    });
  });
});
