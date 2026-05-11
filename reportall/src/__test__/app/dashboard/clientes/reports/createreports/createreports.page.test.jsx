import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateReportClient from '@/app/dashboard/clientes/reports/createreports/page.jsx';
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

jest.mock('next/dynamic', () => () => {
  return function MockMap({ onSelect }) {
    return <button type="button" onClick={() => onSelect([12.1, -86.2])}>mock-map-select</button>;
  };
});

describe('dashboard/clientes/reports/createreports/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.cookie = 'reportall_session=; Path=/; Max-Age=0';
    document.cookie = 'reportall_token=; Path=/; Max-Age=0';
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'cliente', clientId: 10 }));

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ Name_Problem: 'Fuga' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ Name_Sector: 'Sector 1' }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    Object.defineProperty(global, 'navigator', {
      value: {
        geolocation: {
          getCurrentPosition: (success) => success({ coords: { latitude: 12.1, longitude: -86.2 } }),
        },
      },
      configurable: true,
    });
  });

  it('muestra alerta cuando falta el tipo de problema', async () => {
    render(<CreateReportClient />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole('button', { name: 'Aceptar' }).closest('form'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Problema requerido',
        text: 'Debes seleccionar un tipo de problema.',
        confirmButtonText: 'Aceptar',
      });
    });
  });
});
