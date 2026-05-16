import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../src/app/components/SearchBar';

describe('Componente SearchBar', () => {
  test('debe renderizar un input con el placeholder "Buscar" y un textbox', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar');
    expect(input).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  test('debe renderizar los íconos de filtro y búsqueda', () => {
    const { container } = render(<SearchBar />);

    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  test('debe permitir al usuario escribir en el campo de búsqueda', () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'reporte urgente' } });

    expect(input.value).toBe('reporte urgente');
  });
});

