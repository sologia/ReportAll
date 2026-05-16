import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '../src/hooks/useForm';

function ResetForm({ initialForm }) {
  const { formState, onInputChange, onResetForm } = useForm(initialForm);
  return (
    <>
      <input
        name="email"
        value={formState.email}
        onChange={onInputChange}
        placeholder="Email"
      />
      <input
        name="password"
        value={formState.password}
        onChange={onInputChange}
        placeholder="Password"
      />
      <button type="button" onClick={onResetForm}>Reset</button>
      <div data-testid="value">{formState.email}</div>
      <div data-testid="password-value">{formState.password}</div>
    </>
  );
}

describe('Hook useForm - onResetForm', () => {
  test('debe restablecer formState a los valores de initialForm', () => {
    render(<ResetForm initialForm={{ email: 'initial@example.com', password: 'pass' }} />);

    const input = screen.getByPlaceholderText('Email');
    fireEvent.change(input, { target: { name: 'email', value: 'changed@example.com' } });
    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('value').textContent).toBe('initial@example.com');
  });

  test('debe restaurar cada campo rastreado a su valor inicial', () => {
    render(<ResetForm initialForm={{ email: 'initial@example.com', password: 'pass' }} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { name: 'email', value: 'changed@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { name: 'password', value: 'new-pass' } });
    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('value').textContent).toBe('initial@example.com');
    expect(screen.getByTestId('password-value').textContent).toBe('pass');
  });
});

