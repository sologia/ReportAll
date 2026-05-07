import { render, screen } from '@testing-library/react';
import SimpleTable from '../src/app/components/SimpleTable';

describe('SimpleTable Component', () => {
  test('should render correct columns and rows, and show no-data message when empty', () => {
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
});

