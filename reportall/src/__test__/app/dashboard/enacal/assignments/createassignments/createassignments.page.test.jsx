import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateAssignments from '@/app/dashboard/enacal/assignments/createassignments/page.jsx';
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

describe('dashboard/enacal/assignments/createassignments/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('reportall_session', JSON.stringify({ role: 'administrador' }));

    global.fetch = jest.fn((url, options = {}) => {
      const method = options.method || 'GET';
      const href = String(url);

      if (method === 'POST' && href.includes('/api/assignments')) {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      if (href.includes('/api/leaders')) return Promise.resolve({ json: async () => [{ Name_Leader: 'Alejandro' }] });
      if (href.includes('/api/crewsonly')) return Promise.resolve({ json: async () => [{ Num_Crew: 12, Representative_Name: 'Alejandro', District: 'Centro', Crew_Label: 'Cuadrilla Alejandro' }] });
      if (href.includes('/api/states')) return Promise.resolve({ json: async () => [{ StateAs: 'Pendiente' }] });
      if (href.includes('/api/reports/options')) return Promise.resolve({ json: async () => [{ Report_ID: 5, Adress: 'Barrio Centro', District: 'Centro' }] });
      if (href.includes('/api/assignments')) return Promise.resolve({ json: async () => [] });
      if (href.includes('/api/crews')) return Promise.resolve({ json: async () => [{ Crew_ID: 1, Num_Crew: 12, Name_Sector: 'Centro', Availability_Crew: 'Disponible', Plate: 'MZ1234' }] });
      return Promise.resolve({ json: async () => ({}) });
    });
  });

  it('muestra alerta cuando falta la fecha', async () => {
    render(<CreateAssignments />);

    await waitFor(() => {
      expect(document.querySelector('select[name="opciones_lider"]')).not.toBeNull();
    });

    fireEvent.change(document.querySelector('select[name="opciones_lider"]'), { target: { value: 'Alejandro' } });
    fireEvent.change(document.querySelector('select[name="opciones_cuadrillas"]'), { target: { value: '12' } });
    fireEvent.change(document.querySelector('select[name="opciones_reporte"]'), { target: { value: '5' } });
    fireEvent.change(document.querySelector('select[name="opciones_estados"]'), { target: { value: 'Pendiente' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Debes seleccionar la fecha de la asignación.',
        confirmButtonText: 'Aceptar',
      });
    });
  });

  it('crea asignación correctamente con datos válidos', async () => {
    render(<CreateAssignments />);

    await waitFor(() => {
      expect(document.querySelector('select[name="opciones_lider"]')).not.toBeNull();
    });

    fireEvent.change(document.querySelector('input[name="date"]'), { target: { value: '2026-03-26' } });
    fireEvent.change(document.querySelector('select[name="opciones_lider"]'), { target: { value: 'Alejandro' } });
    fireEvent.change(document.querySelector('select[name="opciones_cuadrillas"]'), { target: { value: '12' } });
    fireEvent.change(document.querySelector('select[name="opciones_reporte"]'), { target: { value: '5' } });
    fireEvent.change(document.querySelector('select[name="opciones_estados"]'), { target: { value: 'Pendiente' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/assignments'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Asignación creada',
        text: 'La asignación se registró correctamente.',
        confirmButtonText: 'Aceptar',
      });
    });
  });
});
