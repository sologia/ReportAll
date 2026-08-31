import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CrewAccountsPage from '@/app/dashboard/enacal/craw/accounts/page.jsx';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe('dashboard/enacal/craw/accounts/page.jsx', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url, options = {}) => {
      if ((options.method || 'GET') === 'POST' && String(url).includes('/reset-password')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: true,
            password: 'TmpPass1234',
            account: { User_ID: 1, Email: 'cuadrilla.1@reportall.local', Num_Crew: 12, Is_Active: true },
          }),
        });
      }

      if (String(url).includes('/api/auth/crew-accounts')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ User_ID: 1, Email: 'cuadrilla.1@reportall.local', Display_Name: 'Cuadrilla 12', Num_Crew: 12, Is_Active: true }],
        });
      }

      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test('muestra cuentas y permite regenerar contraseña temporal', async () => {
    render(<CrewAccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('cuadrilla.1@reportall.local')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Regenerar contraseña' }));

    await waitFor(() => {
      expect(fetch.mock.calls.some(([url, options]) => (
        String(url).includes('/reset-password') && options?.method === 'POST'
      ))).toBe(true);
      expect(screen.getByText('TmpPass1234')).toBeInTheDocument();
    });
  });
});