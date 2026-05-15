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
      <input
        name="password"
        value={formState.password}
        onChange={onInputChange}
        placeholder="Password"
      />
      <div data-testid="value">{formState.email}</div>
      <div data-testid="password-value">{formState.password}</div>
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

  test('should preserve other fields when one input changes', () => {
    render(<TestForm initialForm={{ email: 'initial@example.com', password: 'secret' }} />);

    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'updated-secret' } });

    expect(screen.getByTestId('value').textContent).toBe('initial@example.com');
    expect(screen.getByTestId('password-value').textContent).toBe('updated-secret');
  });
});

