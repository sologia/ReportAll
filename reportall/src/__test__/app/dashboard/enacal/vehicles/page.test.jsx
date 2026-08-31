import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import VehiclesPage from '@/app/dashboard/enacal/vehicles/page.jsx';
import Swal from 'sweetalert2';

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe('dashboard/enacal/vehicles/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn((url, options = {}) => {
      if ((options.method || 'GET') === 'POST' && String(url).includes('/api/vehicles')) {
        return Promise.resolve({ ok: true, json: async () => ({ Vehicle_ID: 2, Plate: 'MZ1234' }) });
      }

      if (String(url).includes('/api/vehicles')) {
        return Promise.resolve({ ok: true, json: async () => [{ Vehicle_ID: 1, Plate: 'AB1234' }] });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test('permite agregar una matrícula y muestra confirmación', async () => {
    render(<VehiclesPage />);

    await waitFor(() => {
      expect(screen.getByText('AB1234')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Matrícula'), { target: { value: 'mz1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar matrícula' }));

    await waitFor(() => {
      expect(fetch.mock.calls.some(([url, options]) => (
        String(url).includes('/api/vehicles') && options?.method === 'POST'
      ))).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'success',
        title: 'Matrícula registrada',
      }));
    });
  });
});