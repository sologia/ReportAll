import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '../src/hooks/useForm';

function TestForm({ initialForm }) {
  const { formState, onInputChange } = useForm(initialForm);
  return (
    <>
      <input
        name="email"
        value={formState.email}
        onChange={onInputChange}
        placeholder="Email"
      />
      <div data-testid="value">{formState.email}</div>
    </>
  );
}

describe('useForm Hook - onInputChange', () => {
  test('should update formState when onInputChange is called', () => {
    render(<TestForm initialForm={{ email: '', password: '' }} />);

    const input = screen.getByPlaceholderText('Email');
    fireEvent.change(input, { target: { name: 'email', value: 'test@example.com' } });

    expect(screen.getByTestId('value').textContent).toBe('test@example.com');
  });
});

