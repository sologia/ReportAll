import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateCraw from '@/app/dashboard/enacal/craw/updatecraw/page.jsx';
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

describe('dashboard/enacal/craw/updatecraw/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'administrador' }));

    global.fetch = jest.fn((url, options = {}) => {
      const method = options.method || 'GET';

      if (method === 'PUT' && String(url).includes('/api/crews/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }

      if (String(url).includes('/api/crews/1')) {
        return Promise.resolve({
          json: async () => ({
            Num_Crew: 12,
            Plate: 'MZ1234',
            Name_Sector: 'Alejandro',
            Availability_Crew: 'Disponible',
          }),
        });
      }

      if (String(url).includes('/api/crews')) {
        return Promise.resolve({
          json: async () => [
            {
              Crew_ID: 1,
              Num_Crew: 12,
              Name_Sector: 'Alejandro',
              Availability_Crew: 'Disponible',
              Plate: 'MZ1234',
            },
          ],
        });
      }

      if (String(url).includes('/api/vehicles')) {
        return Promise.resolve({ json: async () => [{ Vehicle_ID: 1, Plate: 'MZ1234' }] });
      }

      if (String(url).includes('/api/sectors')) {
        return Promise.resolve({ json: async () => [{ Sector_ID: 1, Name_Sector: 'Alejandro' }] });
      }

      if (String(url).includes('/api/availabilities')) {
        return Promise.resolve({ json: async () => [{ Availability_Crew_ID: 1, Availability_Crew: 'Disponible' }] });
      }

      return Promise.resolve({ json: async () => ({}) });
    });
  });

  async function seleccionarCuadrilla() {
    render(<UpdateCraw />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '#1 - C12 - Alejandro' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    });
  }

  it('muestra advertencia cuando número de cuadrilla es inválido al modificar', async () => {
    await seleccionarCuadrilla();

    fireEvent.change(document.querySelector('input[name="Num_Crew"]'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Número inválido',
        text: 'El número de cuadrilla debe ser un entero mayor que cero.',
        confirmButtonText: 'Aceptar',
      });
    });
  });

  it('muestra advertencia cuando falta matrícula al modificar', async () => {
    await seleccionarCuadrilla();

    fireEvent.change(document.querySelector('select[name="Plate"]'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Matrícula requerida',
        text: 'Debes seleccionar la matrícula del vehículo.',
        confirmButtonText: 'Aceptar',
      });
    });
  });

  it('muestra advertencia cuando el número de cuadrilla ya pertenece a otra cuadrilla', async () => {
    global.fetch = jest.fn((url, options = {}) => {
      const method = options.method || 'GET';

      if (method === 'PUT' && String(url).includes('/api/crews/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }

      if (String(url).includes('/api/crews/1')) {
        return Promise.resolve({
          json: async () => ({
            Num_Crew: 12,
            Plate: 'MZ1234',
            Name_Sector: 'Alejandro',
            Availability_Crew: 'Disponible',
          }),
        });
      }

      if (String(url).includes('/api/crews')) {
        return Promise.resolve({
          json: async () => [
            {
              Crew_ID: 1,
              Num_Crew: 12,
              Name_Sector: 'Alejandro',
              Availability_Crew: 'Disponible',
              Plate: 'MZ1234',
            },
            {
              Crew_ID: 2,
              Num_Crew: 20,
              Name_Sector: 'Centro',
              Availability_Crew: 'Disponible',
              Plate: 'MZ2222',
            },
          ],
        });
      }

      if (String(url).includes('/api/vehicles')) {
        return Promise.resolve({ json: async () => [{ Vehicle_ID: 1, Plate: 'MZ1234' }] });
      }

      if (String(url).includes('/api/sectors')) {
        return Promise.resolve({ json: async () => [{ Sector_ID: 1, Name_Sector: 'Alejandro' }] });
      }

      if (String(url).includes('/api/availabilities')) {
        return Promise.resolve({ json: async () => [{ Availability_Crew_ID: 1, Availability_Crew: 'Disponible' }] });
      }

      return Promise.resolve({ json: async () => ({}) });
    });

    await seleccionarCuadrilla();

    fireEvent.change(document.querySelector('input[name="Num_Crew"]'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Número duplicado',
        text: 'Ya existe otra cuadrilla registrada con ese número.',
        confirmButtonText: 'Aceptar',
      });
    });

    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/crews/1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('actualiza cuadrilla correctamente con datos válidos', async () => {
    await seleccionarCuadrilla();

    fireEvent.change(document.querySelector('input[name="Num_Crew"]'), { target: { value: '20' } });
    fireEvent.change(document.querySelector('select[name="Plate"]'), { target: { value: 'MZ1234' } });
    fireEvent.change(document.querySelector('select[name="Sector"]'), { target: { value: 'Alejandro' } });
    fireEvent.change(document.querySelector('select[name="Availability"]'), { target: { value: 'Disponible' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crews/1'),
        expect.objectContaining({ method: 'PUT' })
      );
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Cuadrilla actualizada',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonText: 'Aceptar',
      });
    });
  });
});
