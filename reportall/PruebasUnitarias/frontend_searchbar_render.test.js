import { render, screen } from '@testing-library/react';
import SearchBar from '../src/app/components/SearchBar';

describe('SearchBar Component', () => {
  test('should render input with placeholder "Buscar" and a textbox', () => {
    render(<SearchBar />);

    const input = screen.getByPlaceholderText('Buscar');
    expect(input).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });
});

