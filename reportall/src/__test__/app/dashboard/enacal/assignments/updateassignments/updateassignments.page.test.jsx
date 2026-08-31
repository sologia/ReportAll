import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateAssignments from '@/app/dashboard/enacal/assignments/updateassignments/page.jsx';
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

describe('dashboard/enacal/assignments/updateassignments/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'administrador' }));

    global.fetch = jest.fn((url, options = {}) => {
      const method = options.method || 'GET';
      const href = String(url);

      if (method === 'PUT' && href.includes('/api/assignments/1')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      if (href.includes('/api/assignments/1')) {
        return Promise.resolve({
          json: async () => ({
            Name_Leader: 'Alejandro',
            Num_Crew: 12,
            Report_ID: 5,
            StateAs: 'Pendiente',
            Date_time: '2026-03-26T00:00:00.000Z',
          }),
        });
      }
      if (href.includes('/api/assignments')) {
        return Promise.resolve({
          json: async () => [{ Assigment_ID: 1, Name_Leader: 'Alejandro', Num_Crew: 12, Report_ID: 5, StateAs: 'Pendiente' }],
        });
      }
      if (href.includes('/api/leaders')) return Promise.resolve({ json: async () => [{ Name_Leader: 'Alejandro' }] });
      if (href.includes('/api/crewsonly')) return Promise.resolve({ json: async () => [{ Num_Crew: 12 }] });
      if (href.includes('/api/reports/options')) return Promise.resolve({ json: async () => [{ Report_ID: 5, Adress: 'Barrio Centro' }] });
      if (href.includes('/api/states')) return Promise.resolve({ json: async () => [{ StateAs: 'Pendiente' }] });
      return Promise.resolve({ json: async () => ({}) });
    });
  });

  async function seleccionarAsignacion() {
    render(<UpdateAssignments />);

    await waitFor(() => {
      expect(screen.getByText('Alejandro')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => {
      expect(document.querySelector('select[name="Name_Leader"]')).not.toBeNull();
    });
  }

  it('muestra alerta cuando falta el líder', async () => {
    await seleccionarAsignacion();

    fireEvent.change(document.querySelector('select[name="Name_Leader"]'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Líder requerido',
        text: 'Debes seleccionar un líder para la asignación.',
        confirmButtonText: 'Aceptar',
      });
    });
  });

  it('actualiza asignación correctamente con datos válidos', async () => {
    await seleccionarAsignacion();

    fireEvent.change(document.querySelector('select[name="Name_Leader"]'), { target: { value: 'Alejandro' } });
    fireEvent.change(document.querySelector('select[name="Num_Crew"]'), { target: { value: '12' } });
    fireEvent.change(document.querySelector('select[name="Report_ID"]'), { target: { value: '5' } });
    fireEvent.change(document.querySelector('input[name="Fecha"]'), { target: { value: '2026-03-27' } });
    fireEvent.change(document.querySelector('select[name="StateAs"]'), { target: { value: 'Pendiente' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/assignments/1'),
        expect.objectContaining({ method: 'PUT' })
      );
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Asignación actualizada',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonText: 'Aceptar',
      });
    });
  });
});
