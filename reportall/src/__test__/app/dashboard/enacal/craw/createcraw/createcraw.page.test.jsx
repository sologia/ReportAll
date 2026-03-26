import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCraw from '@/app/dashboard/enacal/craw/createcraw/page.jsx';
import Swal from 'sweetalert2';

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

describe('dashboard/enacal/craw/createcraw/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn((url, options = {}) => {
      const method = options.method || 'GET';

      if (method === 'POST' && String(url).includes('/api/crews')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }

      if (String(url).includes('/api/vehicles')) {
        return Promise.resolve({ json: async () => [{ Plate: 'MZ1234' }] });
      }

      if (String(url).includes('/api/sectors')) {
        return Promise.resolve({ json: async () => [{ Name_Sector: 'Alejandro' }] });
      }

      if (String(url).includes('/api/crews')) {
        return Promise.resolve({ json: async () => [] });
      }

      return Promise.resolve({ json: async () => ({}) });
    });
  });

  it('muestra advertencia cuando el número de cuadrilla es inválido', async () => {
    render(<CreateCraw />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Número inválido',
        text: 'El número de cuadrilla debe ser un entero mayor que cero.',
        confirmButtonText: 'Aceptar',
      });
    });

    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/crews'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('muestra advertencia cuando falta matrícula', async () => {
    render(<CreateCraw />);

    await waitFor(() => {
      expect(screen.getByLabelText('Sector')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'Alejandro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes seleccionar la matrícula del vehículo.',
        confirmButtonText: 'Aceptar',
      });
    });
  });

  it('crea cuadrilla correctamente cuando los datos son válidos', async () => {
    render(<CreateCraw />);

    await waitFor(() => {
      expect(screen.getByLabelText('Matrícula')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Matrícula'), { target: { value: 'MZ1234' } });
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'Alejandro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crews'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Cuadrilla creada',
        text: 'La cuadrilla se registró correctamente.',
        confirmButtonText: 'Aceptar',
      });
    });
  });
});
