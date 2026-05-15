import { render, screen } from '@testing-library/react';
import SimpleTable from '../src/app/components/SimpleTable';
import { clearSession, setSession } from '../src/lib/auth';

describe('SimpleTable Component', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    });
    localStorage.clear();
    clearSession();
  });

  test('should render correct columns and rows, and show no-data message when empty', () => {
    setSession({ role: 'administrador' });

    const columns = [
      { header: 'Name', field: 'name' },
      { header: 'ID', field: 'id' }
    ];
    const data = [
      { name: 'Item 1', id: 1 },
      { name: 'Item 2', id: 2 }
    ];

    const { rerender } = render(<SimpleTable columns={columns} data={data} />);

    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Item 1')).toBeTruthy();
    expect(screen.getByText('Item 2')).toBeTruthy();

    rerender(<SimpleTable columns={columns} data={[]} />);
    expect(screen.getByText('No hay datos')).toBeTruthy();
  });

  test('should hide ID and urgency columns for a cliente session', () => {
    setSession({ role: 'cliente' });

    render(
      <SimpleTable
        columns={[
          { header: 'ID', field: 'id' },
          { header: 'Urgencia', field: 'urgency' },
          { header: 'Estado', field: 'state' },
        ]}
        data={[{ id: 10, urgency: 'Alta', state: 'recibido' }]}
      />
    );

    expect(screen.queryByText('ID')).toBeNull();
    expect(screen.queryByText('Urgencia')).toBeNull();
    expect(screen.getByText('Estado')).toBeTruthy();
    expect(screen.getByText('recibido')).toHaveClass('bg-sky-100');
  });
});

