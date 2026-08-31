import { render, screen } from '@testing-library/react';
import StateBadge from '../src/app/components/StateBadge';

describe('Componente StateBadge', () => {
  test('debe mostrar el color y texto correctos para distintos estados', () => {
    const { rerender } = render(<StateBadge value="recibido" />);
    expect(screen.getByText('recibido')).toBeTruthy();
    expect(screen.getByText('recibido')).toHaveClass('bg-sky-100');

    rerender(<StateBadge value="proceso" />);
    expect(screen.getByText('proceso')).toHaveClass('bg-yellow-100');

    rerender(<StateBadge value="terminado" />);
    expect(screen.getByText('terminado')).toHaveClass('bg-green-100');
  });

  test('debe usar una insignia neutra cuando el estado está vacío o es desconocido', () => {
    const { rerender } = render(<StateBadge value="" />);

    expect(screen.getByText('Sin estado')).toHaveClass('bg-gray-100');

    rerender(<StateBadge value="pendiente" />);
    expect(screen.getByText('pendiente')).toHaveClass('bg-gray-100');
  });
});

