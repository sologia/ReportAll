import { render, screen } from '@testing-library/react';
import StateBadge from '../src/app/components/StateBadge';

describe('StateBadge Component', () => {
  test('should display correct color/text for different statuses', () => {
    const { rerender } = render(<StateBadge value="recibido" />);
    expect(screen.getByText('recibido')).toBeTruthy();
    expect(screen.getByText('recibido')).toHaveClass('bg-sky-100');

    rerender(<StateBadge value="proceso" />);
    expect(screen.getByText('proceso')).toHaveClass('bg-yellow-100');

    rerender(<StateBadge value="terminado" />);
    expect(screen.getByText('terminado')).toHaveClass('bg-green-100');
  });

  test('should fallback to a neutral badge when the state is empty or unknown', () => {
    const { rerender } = render(<StateBadge value="" />);

    expect(screen.getByText('Sin estado')).toHaveClass('bg-gray-100');

    rerender(<StateBadge value="pendiente" />);
    expect(screen.getByText('pendiente')).toHaveClass('bg-gray-100');
  });
});

