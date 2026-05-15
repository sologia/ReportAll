import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../src/app/components/SearchBar';

describe('SearchBar Component', () => {
  test('should render input with placeholder "Buscar" and a textbox', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar');
    expect(input).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  test('should render the filter and search icons', () => {
    const { container } = render(<SearchBar />);

    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  test('should allow the user to type in the search input', () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'reporte urgente' } });

    expect(input.value).toBe('reporte urgente');
  });
});

