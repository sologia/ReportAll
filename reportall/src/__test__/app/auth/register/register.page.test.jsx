import '@testing-library/jest-dom';
import RegisterPage from '@/app/auth/register/page.jsx';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

const pushMock = jest.fn();

jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('auth/register/page.jsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  function fillForm() {
    fireEvent.change(screen.getByPlaceholderText('Primer nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByPlaceholderText('Primer apellido'), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByPlaceholderText('Numero NIC'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'ana@test.com' } });
  }

  it('renderiza formulario de registro', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repita la contraseña')).toBeInTheDocument();
  });

  it('muestra advertencia cuando falta el nombre', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Primer apellido'), { target: { value: 'Perez' } });
    fireEvent.change(screen.getByPlaceholderText('Numero NIC'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Crear cuenta' }).closest('form'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Debes ingresar el primer nombre.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra advertencia cuando NIC tiene caracteres no numéricos', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Numero NIC'), { target: { value: '12AB56' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear cuenta' }).closest('form'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Número NIC inválido',
        text: 'El número NIC debe contener solo números y tener entre 6 y 10 dígitos.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra advertencia cuando NIC tiene menos de 6 dígitos', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Numero NIC'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear cuenta' }).closest('form'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Número NIC inválido',
        text: 'El número NIC debe contener solo números y tener entre 6 y 10 dígitos.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra advertencia cuando el correo no es válido', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'ana-test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear cuenta' }).closest('form'));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico válido.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra advertencia cuando la contraseña es muy corta', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra alerta cuando las contraseñas no coinciden', async () => {
    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Contraseñas diferentes',
        text: 'Las contraseñas no coinciden.',
        confirmButtonText: 'Aceptar',
      });
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('muestra error cuando el backend rechaza el registro', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Este correo ya está registrado' }),
    });

    render(<RegisterPage />);
    fillForm();
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Registro fallido',
        text: 'Este correo ya está registrado',
        confirmButtonText: 'Entendido',
      });
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('registra usuario correctamente y redirecciona a login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, user: { email: 'ana@test.com' } }),
    });

    render(<RegisterPage />);
    fillForm();

    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Repita la contraseña'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Registro completado',
        text: 'Cuenta creada correctamente. Ahora debes iniciar sesión.',
        confirmButtonText: 'Continuar',
      });
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });
});
