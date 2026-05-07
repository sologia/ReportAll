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
      <button type="button" onClick={onResetForm}>Reset</button>
      <div data-testid="value">{formState.email}</div>
    </>
  );
}

describe('useForm Hook - onResetForm', () => {
  test('should reset formState to initialForm values', () => {
    render(<ResetForm initialForm={{ email: 'initial@example.com', password: 'pass' }} />);

    const input = screen.getByPlaceholderText('Email');
    fireEvent.change(input, { target: { name: 'email', value: 'changed@example.com' } });
    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('value').textContent).toBe('initial@example.com');
  });
});

